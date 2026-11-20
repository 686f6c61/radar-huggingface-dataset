# CladeTeam/CENO-P-1B

## Resumen

CENO-P-1B es un modelo fundacional de ADN de 1.302 millones de parámetros desarrollado por CladeTeam, especializado en predicción de efectos de variantes (VEP, *variant effect prediction*) mediante alineamiento multi-especie (MSA). Se trata de la variante post-entrenada sobre MSA de la familia CENO, y su propósito es puntuar secuencias salvajes frente a variantes calculando el delta de log-verosimilitud, una técnica estándar en genómica computacional para priorizar mutaciones con impacto funcional.

El modelo emplea una arquitectura híbrida Mamba / Attention / Mixture-of-Experts (8 expertos, top-2 por token) basada en Nemotron-H, con 38 capas, tamaño oculto de 1024, 16 cabezas de atención y tamaño intermedio de 4096. El tokenizador es de nivel de carácter (vocabulario de 512), mapeando bases de ADN a sus códigos ASCII de byte. Esta elección elimina la dependencia de vocabularios de k-meros y permite procesar secuencias arbitrarias sin artefactos de tokenización.

Su relevancia actual reside en que combina dos tendencias técnicas: por un lado, el uso de arquitecturas híbridas SSM/atención para secuencias largas (ADN genómico), y por otro, el post-entrenamiento específico sobre MSA para mejorar la sensibilidad en VEP. El checkpoint es autocontenido y cargable con `trust_remote_code=True`, con licencia Apache-2.0, lo que facilita su integración en pipelines de investigación genómica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 1.302.429.280 (1302,4 M) |
| Parametros activos | 8 expertos, top-2 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en float32) |
| Idiomas soportados | no aplica (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido que combina capas Mamba (SSM), capas de atención y capas Mixture-of-Experts, siguiendo la arquitectura Nemotron-H de NVIDIA. Cuenta con 38 capas ocultas, tamaño oculto de 1024, 16 cabezas de atención y tamaño intermedio de 4096. La capa MoE dispone de 8 expertos con enrutamiento top-2 por token. El tokenizador es de nivel de carácter con vocabulario de 512, derivado del `CharLevelTokenizer` de Evo2 (Arc Institute), que mapea cada base de ADN a su byte ASCII.

El modelo es la variante post-entrenada sobre MSA de la familia CENO: parte del modelo base CENO-1B y se somete a un post-entrenamiento específico para VEP. Incluye `intra_encoding_pattern` en su configuración y una ruta de scoring MSA (`modeling_ceno_p.py`) que consume un `seq_idx` por token para puntuar entradas MSA empaquetadas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF/DPO. El código del modelo deriva de la implementación de Nemotron-H en Hugging Face (Apache-2.0). Las capas Mamba requieren kernels CUDA, por lo que la inferencia y la generación necesitan GPU; la carga de configuración, tokenizador y pesos es segura en CPU.

## Capacidades

- Puntuación de efectos de variantes (VEP) mediante delta de log-verosimilitud entre secuencia salvaje y variante.
- Procesamiento de alineamientos multi-especie (MSA) empaquetados mediante `seq_idx` por token.
- Generación de secuencias genómicas (heredada del modelo base CENO).
- Extracción de embeddings de secuencias de ADN para tareas downstream.
- Tokenización a nivel de carácter que acepta cualquier secuencia de bases sin vocabulario de k-meros.
- Adaptación downstream mediante fine-tuning o probing para tareas genómicas.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM de lenguaje natural.
- No dispone de capacidades multilingües, visión ni audio.

## Casos de uso

- Priorización de variantes en estudios de asociación genómica: el modelo puntúa variantes candidatas calculando el delta de log-verosimilitud frente a la secuencia de referencia, permitiendo ordenar mutaciones por impacto funcional predicho antes de validación experimental.
- Análisis de variantes en contexto multi-especie: al estar post-entrenado sobre MSA, puede aprovechar señales de conservación evolutiva entre especies para distinguir variantes benignas de patogénicas en regiones codificantes y reguladoras.
- Filtrado previo en pipelines de diagnóstico genético: integrado como etapa de scoring en un pipeline bioinformático, reduce el número de variantes a validar experimentalmente en estudios de enfermedades mendelianas.
- Extracción de embeddings para modelos downstream: los embeddings del modelo base CENO pueden alimentar clasificadores de regiones regulatorias, predicción de expresión génica o anotación funcional.
- Investigación en genómica comparada: el soporte MSA permite analizar regiones conservadas y estimar presiones selectivas sobre posiciones concretas del genoma.
- Generación de secuencias de ADN sintéticas: el modelo base puede generar secuencias candidatas para diseño experimental, con la advertencia de que la corrección numérica no garantiza funcionalidad biológica.
- Fine-tuning para tareas genómicas específicas: al ser un modelo de 1,3B parámetros con licencia Apache-2.0, es viable adaptarlo con recursos moderados a tareas como predicción de splicing o de sitios de unión de factores de transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 5,2 GB solo para pesos (1.302 M parámetros × 4 bytes), más overhead de activaciones y kernels. El tamaño del repo es de 5,2 GB.
- GPU obligatoria para forward passes y generación: las capas Mamba requieren kernels CUDA. La carga de configuración, tokenizador y pesos es posible en CPU.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, una GPU con al menos 8-12 GB de VRAM debería ser suficiente en float32; una RTX 4090 o A100/H100 cubren el requisito con holgura.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en float32, aunque no se confirma en la documentación.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el autor indica que HF y vLLM usan entornos separados. Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| CENO-P-1B | 1.302 M | no disponible | Híbrida Mamba/Attention/MoE | Apache-2.0 | VEP con MSA |
| CENO-1B (base) | ~1.300 M (no confirmado) | no disponible | Híbrida Mamba/Attention/MoE | Apache-2.0 | Generación y embeddings de ADN |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | Apache-2.0 (tokenizador derivado) | Modelo fundacional de ADN |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La corrección numérica no garantiza generación libre de repeticiones ni funcionalidad biológica: el propio autor lo advierte explícitamente.
- Requiere GPU con kernels CUDA para inferencia; no es desplegable en CPU para forward passes.
- No se especifica la longitud de contexto, lo que impide planificar el procesamiento de secuencias genómicas largas sin validación empírica.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre su composición, lo que limita la evaluación de sesgos por especie o región genómica.
- El modelo está diseñado para secuencias de ADN, no para lenguaje natural; no debe emplearse como LLM convencional.
- La licencia Apache-2.0 permite uso comercial, pero el código deriva de Nemotron-H (NVIDIA) y el tokenizador de Evo2 (Arc Institute), ambos Apache-2.0; deben conservarse los archivos `LICENSE` y `NOTICE` con la atribución completa.
- El checkpoint es autocontenido pero depende de `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en producción.
- No se han publicado benchmarks, por lo que no es posible comparar su rendimiento en VEP con alternativas establecidas.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-P-1B
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Ejemplo de VEP con TraitGym: incluido en el repositorio de código CENO
