# Bob99Bob/d3-lite-mlx-affine6

## Resumen

d3-lite-mlx-affine6 es una conversión a formato MLX del modelo d3-lite (Decision 3.0), publicado originalmente por el equipo vLLM Semantic Router (vllm-sr/d3-lite). El autor de esta conversión es Bob99Bob, y su propósito es permitir que el modelo se ejecute de forma nativa en Apple Silicon mediante la librería MLX. No se ha entrenado ni ajustado nada: los pesos son los del editor original, únicamente reempaquetados y cuantizados. El repositorio contiene solo los ficheros generados por la conversión; los ficheros originales del editor (tokenizer, chat template) no se copian y deben descargarse por separado desde el repositorio de origen.

El modelo tiene 752.654.144 parámetros (unos 753 millones) y está etiquetado como text-classification, con una función concreta dentro del ecosistema veJ: actúa como uno de los "pequeños lectores" que los distintos niveles consultan antes del juez principal. Es decir, no es un modelo generativo de propósito general, sino un componente de clasificación/lectura dentro de un pipeline de enrutamiento semántico.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización affine de 6 bits con group size 64 aplicada a los embeddings de tokens y a los 187 módulos Linear de las capas del transformer; por otro, ilustra el patrón de conversión MLX para despliegue en Mac. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura del modelo base vllm-sr/d3-lite; detalles no disponibles) |
| Parametros totales | 752.654.144 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 6-bit, group size 64 (embeddings de tokens y 187 módulos Linear); resto de tensores sin cuantizar; readout en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base vllm-sr/d3-lite (Decision 3.0), del que esta conversión no altera ningún peso: solo se aplica cuantización affine de 6 bits con group size 64 a los embeddings de tokens y a los 187 módulos Linear de las capas del transformer, usando `quantize_model` de mlx-lm sobre MLX 0.32.2. El resto de tensores permanece intacto y el readout se mantiene en float32. No hay entrenamiento, ajuste fino ni RLHF asociado a esta conversión.

El proceso de conversión se realiza con un script propio de veJ (`server/decision2/mlx_d3.py --convert <publisher dir> <out> --bits 6`), que además genera un fichero `mlx-conversion.json` con el tamaño y el sha256 de cada fichero, verificado por el servidor en tiempo de carga. El `config.json` es el del editor, con la información de cuantización y un registro `d3_derivative` que documenta el formato y la revisión de origen. El tokenizer y la plantilla de chat no se incluyen y se toman del repositorio original en la misma revisión (`3c49f5c0bd48a4b28e29b8ec1f38f56e199f3d61`).

## Capacidades

- Clasificación de texto y lectura de decisiones dentro de un pipeline de enrutamiento semántico (función etiquetada: text-classification).
- Actúa como "lector" previo al juez en los distintos niveles del sistema veJ.
- Ejecución nativa en Apple Silicon mediante MLX.
- Cuantización de 6 bits que preserva todas las reglas de enrutamiento para las que el modelo publicado está cualificado (según las mediciones del autor).
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento semántico en producción: el modelo se usa como lector de decisión dentro de veJ para clasificar consultas antes de pasarlas al juez principal, aprovechando su pequeño tamaño (753 M de parámetros) y su bajo coste de inferencia.
- Despliegue local en Mac para desarrollo: gracias a la conversión MLX, se puede ejecutar en Apple Silicon sin GPU dedicada, lo que facilita probar el pipeline de decisión en un portátil o Mac mini.
- Evaluación de cuantizaciones: sirve como caso de estudio para comparar la fidelidad de distintos niveles de bits (4, 5, 6 y 8) frente al modelo original, con métricas de acuerdo publicadas por el autor.
- Integración en pipelines de clasificación de bajo coste: al ser un modelo de 753 M, puede desplegarse en entornos con recursos limitados donde un modelo mayor no sería viable.
- Prototipado de sistemas de decisión multi-etapa: útil para investigadores que quieran reproducir o extender la arquitectura de "lectores + juez" de veJ.
- Verificación de integridad en despliegues: el fichero `mlx-conversion.json` con sha256 por fichero permite validar la carga del modelo en entornos de producción.

## Benchmarks y rendimiento

El autor publica métricas de acuerdo (agreement) con las respuestas del modelo publicado, medidas sobre los modelos Decision 2.0 y 3.0 servidos:

| Cuantizacion | Agreement con el modelo publicado |
|---|---|
| 4 bits | 0.876 a 0.990 |
| 5 bits | 0.955 a 0.996 |
| 6 bits | 0.972 a 0.995 |

Además, el autor indica que 6 bits conserva todas las reglas de enrutamiento para las que el modelo publicado está cualificado; 4 bits pierde la regla sí/no, 5 bits la regla de dos opciones, y 8 bits no mejora respecto a 6. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0.6 GB, por lo que la inferencia en 6 bits requiere del orden de esa cantidad de memoria, más overhead del runtime MLX.
- GPU recomendadas: Apple Silicon (M-series) con soporte MLX; no se especifican modelos concretos de GPU NVIDIA.
- Cabe en GPU consumer: sí, en cualquier Mac con Apple Silicon; el tamaño es reducido.
- Opciones de despliegue: MLX (mlx-lm) y el servidor de veJ (`server/decision2/decision2_server.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| d3-lite-mlx-affine6 (esta ficha) | 752.654.144 | no disponible | safetensors MLX, 6-bit affine | Apache-2.0 | Conversión MLX para Apple Silicon |
| vllm-sr/d3-lite (base) | no disponible | no disponible | safetensors | Apache-2.0 | Modelo original del editor |
| Otras conversiones MLX de d3-lite | no disponible | no disponible | no disponible | no disponible | No se detallan en la información |

No se dispone de información sobre modelos comparables adicionales de la misma categoría (clasificadores de enrutamiento de ~750 M) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo de propósito general: está etiquetado como text-classification y su función es la lectura/decisión dentro de veJ.
- Los ficheros de tokenizer y plantilla de chat no están incluidos; deben descargarse del repositorio original en la revisión exacta indicada, lo que añade un paso manual al despliegue.
- La cuantización de 4 bits pierde la regla de enrutamiento sí/no y la de 5 bits pierde la regla de dos opciones; solo 6 bits conserva todas las reglas, según el autor.
- Las métricas de agreement son mediciones propias de veJ, no benchmarks estándar revisados por terceros.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible (el modelo es de clasificación, no de generación abierta).
- Restricciones de licencia: Apache-2.0, permite uso comercial; se debe conservar el aviso del editor en `NOTICE`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Bob99Bob/d3-lite-mlx-affine6
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Repositorio veJ: https://github.com/ordinarybob/vej
- Metodología y resultados de benchmarks de veJ: https://github.com/ordinarybob/vej/blob/main/docs/BENCHMARKS.md
