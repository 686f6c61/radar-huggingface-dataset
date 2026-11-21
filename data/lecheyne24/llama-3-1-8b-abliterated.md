# lecheyne24/llama-3.1-8b-abliterated

## Resumen

`lecheyne24/llama-3.1-8b-abliterated` es una versión "abliterated" (sin mecanismos de rechazo) del modelo `meta-llama/Llama-3.1-8B-Instruct` de Meta, publicada por el usuario lecheyne24 en formato GGUF cuantizado a Q4_K_M para su uso con llama.cpp. El modelo conserva la arquitectura transformer densa del Llama 3.1 8B original (8.030.261.312 parámetros) y aplica una técnica de biproyección de rango 1 que preserva la norma sobre las proyecciones `o_proj` y `down_proj` de todas las capas, con un factor alpha de 1,25.

El objetivo de esta modificación es eliminar la dirección de rechazo aprendida durante el alineamiento del modelo Instruct, de modo que el modelo responda a peticiones que el original rechazaría. El autor reporta una prueba interna ("plain-answer gauntlet") con 7 aciertos sobre 8, donde el único fallo consistió en responder "Jogging is running." sin la frase marcadora esperada.

La relevancia de esta ficha es acotada: se trata de una cuantización comunitaria con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados. Es útil como referencia para quienes evalúan variantes sin censura de Llama 3.1 8B, pero no debe confundirse con un modelo oficial ni con una release mantenida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.1 8B Instruct) |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de ejecución usa `-c 4096`) |
| Tipos de cuantización | Q4_K_M (GGUF); el autor no documenta otras |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer denso de 8.030 millones de parámetros con atención por grupos (GQA) y tokenizador BPE de Llama 3. Sobre esa base, el autor aplica una modificación de pesos denominada "refusal-direction rank-1 norm-preserving biprojection" sobre `o_proj` y `down_proj` en todas las capas, con alpha 1,25. Esta técnica proyecta los pesos fuera de la dirección asociada al rechazo, preservando la norma de las matrices para minimizar el daño colateral en capacidades generales.

No se documenta ningún entrenamiento adicional, fine-tuning supervisado, RLHF ni DPO tras la modificación. Tampoco se especifican tokens de entrenamiento, composición del dataset ni proceso de calibración de la cuantización. La única validación reportada es la prueba "plain-answer gauntlet" (7/8), que no constituye una evaluación estandarizada de capacidades.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Instruct base.
- Razonamiento y matemáticas básicas propias de un modelo de 8B (sin datos verificados en esta ficha).
- Generación de código, limitada por el tamaño del modelo.
- Respuesta a peticiones que el Instruct original rechazaría, gracias a la eliminación de la dirección de rechazo.
- Soporte de plantilla de chat de Llama 3.1 (roles system/user/assistant) al ejecutarse con llama.cpp.
- Compatibilidad con endpoints OpenAI-style mediante `llama-server`.
- Tool calling y function calling: no verificado en esta variante; el Instruct base lo soporta, pero la modificación puede degradarlo.
- Capacidades multimodales, de audio o thinking mode: no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: comparar respuestas del modelo abliterated frente al Instruct original para estudiar cómo se distribuye la dirección de rechazo y qué capacidades se degradan tras la biproyección.
- Evaluación de robustez de filtros: usar el modelo como generador adversario controlado en un entorno de laboratorio para probar clasificadores de contenido y políticas de moderación.
- Generación creativa sin restricciones temáticas: escritura de ficción con temáticas sensibles (violencia, terror, drama adulto) donde el Instruct original rechazaría la petición; requiere revisión humana posterior.
- Despliegue local en hardware de consumo: al estar en GGUF Q4_K_M, cabe en GPUs con 6-8 GB de VRAM o incluso en CPU, lo que permite prototipado offline sin dependencias de API.
- Experimentos de rol y simulación de personajes: el modelo puede mantener personajes con aristas moralmente ambiguas sin romper el rol por rechazo.
- Base para fine-tuning posterior: servir como punto de partida para ajustes específicos de dominio donde el filtrado del Instruct base resulta un obstáculo (por ejemplo, datasets de ciberseguridad ofensiva en entornos autorizados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una prueba interna ("plain-answer gauntlet") con 7 aciertos sobre 8, sin especificar el conjunto de prompts ni la metodología.

## Requisitos de hardware

- VRAM estimada en Q4_K_M: en torno a 5-6 GB para los pesos, más overhead de contexto KV; con 4K de contexto, un total práctico de 6-8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A10, L4, A100 y H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más; en 6 GB requiere contexto reducido.
- Despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (importando el GGUF), y otros runners compatibles con GGUF. vLLM y TGI no cargan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lecheyne24/llama-3.1-8b-abliterated | 8,03B | no disponible | no disponible | GGUF Q4_K_M | Variante abliterated comunitaria, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K | Llama 3.1 Community License | safetensors, GGUF oficial | Modelo base alineado, con rechazos |
| Otras variantes abliterated de Llama 3.1 8B (p. ej. huihui-ai/Llama-3.1-8B-Instruct-abliterated) | 8,03B | 128K | habitualmente heredada de Llama 3.1 | safetensors, GGUF | Métodos y calidad variables; no verificado en esta ficha |

La comparación con otras variantes abliterated no puede completarse con datos verificados en esta ficha; se indica como referencia cualitativa.

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo puede degradar capacidades generales (razonamiento, instrucciones, seguridad) de forma no medida; no hay benchmarks que lo cuantifiquen.
- Riesgo elevado de generar contenido dañino, ilegal o sexual explícito; no apto para producción orientada al público sin moderación externa.
- Licencia no declarada: la licencia del modelo base (Llama 3.1 Community License) impone restricciones de uso comercial, atribución y nomenclatura; la ausencia de licencia explícita en este repo no exime de cumplirla.
- Idiomas no declarados; se asume el multilingüismo del Llama 3.1 base, pero sin verificación.
- Contexto no documentado; el ejemplo de ejecución limita a 4096 tokens, muy por debajo de los 128K del base.
- Repo con 0 descargas y 0 likes: sin evidencia de uso, mantenimiento ni validación por terceros.
- Tool calling y function calling no verificados; pueden haberse visto afectados por la modificación de pesos.
- El único test reportado (7/8) es interno, no reproducible y sin conjunto de evaluación público.

## Enlaces

- Hugging Face: https://huggingface.co/lecheyne24/llama-3.1-8b-abliterated
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
