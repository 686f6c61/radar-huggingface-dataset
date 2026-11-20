# mradermacher/TinyNewsLlama-1.1B-GGUF

## Resumen

TinyNewsLlama-1.1B-GGUF es una colección de cuantizaciones en formato GGUF del modelo TinyNewsLlama-1.1B, desarrollado originalmente por el usuario h4rz3rk4s3 y cuantizado por mradermacher. Se trata de un ajuste fino mediante QLoRA y SFT (supervised fine-tuning) sobre TinyLlama, orientado a la generación y el tratamiento de contenido de actualidad política y noticias en inglés. El modelo base cuenta con 1.100.048.384 parámetros (aproximadamente 1,1 mil millones) y está publicado bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que el repositorio no contiene el modelo original en safetensors, sino únicamente cuantizaciones estáticas en GGUF generadas por mradermacher, lo que facilita su despliegue en entornos con recursos limitados mediante llama.cpp u Ollama. El modelo está pensado para un dominio muy concreto (noticias y política en inglés) y no para uso generalista.

La ficha se centra en lo que el repositorio realmente ofrece: una batería de cuantizaciones que van desde Q2_K (0,5 GB) hasta f16 (2,3 GB), todas ellas derivadas del modelo base de h4rz3rk4s3. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de TinyLlama); detalles específicos no disponibles |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors solo en el modelo base original |

## Arquitectura y entrenamiento

El modelo subyacente es TinyLlama, un transformer decoder-only de aproximadamente 1,1 mil millones de parámetros. Según las etiquetas de la model card, el ajuste se realizó mediante QLoRA y SFT (supervised fine-tuning) sobre el modelo base TinyLlama, especializándolo en contenido de noticias y política en inglés. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas posteriores de RLHF o DPO.

El repositorio de mradermacher no aporta información adicional sobre la arquitectura interna ni sobre innovaciones técnicas del modelo original. Las cuantizaciones son estáticas (no se han generado variantes con imatrix o ponderadas según la propia model card), lo que implica que la calidad de las cuantizaciones de baja precisión puede ser inferior a la de variantes imatrix equivalentes.

## Capacidades

- Generación de texto en inglés, con especialización declarada en temáticas de noticias y política.
- Formato conversacional (etiqueta `conversational` en el repositorio).
- Ajuste fino supervisado (SFT) para respuestas a instrucciones dentro del dominio de noticias.
- Capacidad multilingüe limitada al inglés (idioma declarado: `en`).
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Resumen de noticias políticas: el modelo puede recibir un artículo y generar un resumen breve en inglés, aprovechando su ajuste específico sobre contenido periodístico y político.
- Clasificación temática de titulares: dado su entrenamiento en el dominio de noticias, puede utilizarse para etiquetar o categorizar titulares y párrafos por temática política.
- Generación de borradores de notas breves: útil para producir textos cortos de actualidad en inglés que luego un editor humano revise.
- Prototipado rápido en local: gracias a las cuantizaciones de 0,5-0,9 GB, se puede desplegar en portátiles y equipos sin GPU dedicada para experimentar con generación de texto especializada.
- Filtrado y triaje de contenidos informativos: integrado en un pipeline de procesamiento de fuentes RSS o feeds, el modelo puede clasificar o descartar piezas según relevancia política.
- Educación y demostraciones: su reducido tamaño y licencia Apache 2.0 lo hacen adecuado para talleres y demostraciones de fine-tuning y cuantización en el dominio periodístico.
- Experimentación con QLoRA: sirve como caso de estudio de un modelo pequeño ajustado con QLoRA y posteriormente cuantizado a GGUF para despliegue en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K ~0,5 GB; Q3_K_S/M/L ~0,6-0,7 GB; IQ4_XS y Q4_K_S/M ~0,7-0,8 GB; Q5_K_S/M ~0,9 GB; Q6_K ~1,0 GB; Q8_0 ~1,3 GB; f16 ~2,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 2-4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060 o superiores permiten ejecutar la variante f16 con holgura. En GPU de datacenter (A100, H100) el modelo es sobredimensionado para su tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM; también en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints (`endpoints_compatible`) y librería `transformers` para el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TinyNewsLlama-1.1B-GGUF | 1,1 B | no disponible | Apache 2.0 | GGUF en HF | Especializado en noticias/política en inglés |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens (modelo original) | Apache 2.0 | Safetensors y GGUF en HF | Base generalista; contexto según el modelo original |
| Qwen2.5-1.5B | 1,5 B | 32.768 tokens (modelo original) | Apache 2.0 | Safetensors y GGUF en HF | Base generalista multilingüe |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens (modelo original) | Apache 2.0 | Safetensors y GGUF en HF | Base generalista en inglés |

Nota: los datos de contexto de los modelos comparativos corresponden a sus versiones originales publicadas; no se dispone de datos de rendimiento comparativo para TinyNewsLlama-1.1B.

## Limitaciones y advertencias

- Modelo de muy pequeño tamaño (1,1 B), con capacidad de razonamiento y conocimiento factual limitada en comparación con modelos de mayor escala.
- Especializado en noticias y política en inglés: su rendimiento fuera de ese dominio o en otros idiomas (incluido el castellano) es previsiblemente pobre.
- Riesgo elevado de alucinación y de generar información política incorrecta o desactualizada; no debe usarse como fuente de verdad sin verificación humana.
- No se han publicado datos sobre sesgos del dataset de entrenamiento; al tratar temática política, existe riesgo de sesgo editorial heredado de los datos.
- Solo se distribuyen cuantizaciones estáticas; no hay variantes imatrix, lo que puede degradar la calidad en las cuantizaciones más agresivas (Q2_K, Q3_K).
- La licencia Apache 2.0 permite uso comercial, pero el autor del modelo base no documenta la procedencia de los datos de entrenamiento, lo que traslada riesgo legal al usuario.
- No se declara longitud de contexto; conviene asumir valores conservadores (los típicos de TinyLlama) hasta verificar experimentalmente.
- El repositorio tiene muy poca tracción (267 descargas, 1 like), por lo que no cuenta con validación comunitaria extensa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/TinyNewsLlama-1.1B-GGUF
- Modelo base original: https://huggingface.co/h4rz3rk4s3/TinyNewsLlama-1.1B
- Página de descargas del cuantizador: https://hf.tst.eu/model#TinyNewsLlama-1.1B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
