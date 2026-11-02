# andrzej/smollm2-135M-SFT-Only-ONNX

## Resumen

`andrzej/smollm2-135M-SFT-Only-ONNX` es una conversión a formato ONNX del modelo `HuggingFaceTB/smollm2-135M-SFT-Only`, un modelo de lenguaje de 135 millones de parámetros derivado de la familia SmolLM2 de Hugging Face. El repositorio no entrena ni modifica los pesos: se limita a exportar el grafo a ONNX (fp32 e int8) para permitir su ejecución en el navegador mediante Transformers.js 4.3.2. Su propósito declarado es servir de pieza en una aplicación educativa que compara en paralelo las variantes base, SFT y SFT + DPO de SmolLM2-135M.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo típico de conversión de un modelo pequeño a ONNX con `optimum-cli` y cuantización dinámica con ONNX Runtime. Por otro, documenta una advertencia importante sobre trazabilidad: el linaje de `SFT-Only` no está confirmado, ya que la model card del modelo original nombra SmolLM2-135M mientras que sus metadatos apuntan a `135M-lc-100k-rope-12B`, y la card de Instruct no menciona a SFT-Only como base.

El modelo es de arquitectura transformer tipo Llama, con 135M de parámetros, contexto no especificado en la información disponible y entrenamiento exclusivamente en inglés. No es un modelo apto para producción general: es una pieza de demostración y experimentación con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tag `llama` del repositorio) |
| Parametros totales | 135M (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (`onnx/model.onnx`) e int8 dinámica (`onnx/model_int8.onnx`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | `other`; el repositorio upstream no tiene etiqueta de licencia (`upstream-has-no-license-tag`) |
| Formato de pesos | ONNX (fp32 e int8); el modelo base publica safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de estilo Llama, tal como indica el tag `llama` del repositorio y su pertenencia a la familia SmolLM2. El modelo base `smollm2-135M-SFT-Only` se presenta como una variante afinada con SFT (supervised fine-tuning) sobre SmolLM2-135M, aunque el linaje exacto no está confirmado: la model card del modelo original cita SmolLM2-135M como base, mientras que sus metadatos nombran `135M-lc-100k-rope-12B`. El autor de la conversión mide la diferencia entre pesos (norma L2 de la diferencia sobre la norma L2 de los pesos) y obtiene un 0,008% entre SFT-Only e Instruct y un 8,6% entre SFT-Only y SmolLM2-135M, lo que sugiere que Instruct se derivó de SFT-Only o de una copia muy cercana, sin que ello constituya prueba.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base. La conversión a ONNX se realizó localmente con `optimum-cli export onnx --task text-generation-with-past --opset 14`, usando optimum 1.23.3, transformers 4.46.3, torch 2.5.1 (CPU), onnx 1.17.0 y onnxruntime 1.20.1. La versión int8 se generó con cuantización dinámica (`quantize_dynamic` con `QuantType.QInt8`). El fichero fp32 ocupa 652,5 MB frente a los 540 MB de otras builds fp32 de SmolLM2-135M, aparentemente porque la exportación almacena por separado los pesos de embedding y de salida que en el original están atados.

## Capacidades

- Generación de texto conversacional en inglés, orientada a demostraciones de chat.
- Ejecución en navegador mediante Transformers.js 4.3.2, sin backend de servidor.
- Inferencia con caché de clave/valor (`text-generation-with-past`), lo que reduce el coste de decodificación autoregresiva.
- Cuantización int8 dinámica para reducir el tamaño del grafo a 164,9 MB.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés según la metadata del repositorio.

## Casos de uso

- Demostración educativa en navegador: la aplicación original compara lado a lado las variantes base, SFT y SFT + DPO de SmolLM2-135M; este repositorio aporta la variante SFT en ONNX para ejecutarse íntegramente en el cliente.
- Prototipado de chatbots de juguete: con 135M de parámetros y cuantización int8, permite validar flujos de conversación multi-turno en entornos sin GPU ni servidor.
- Pruebas de integración de Transformers.js: sirve como caso de referencia para verificar la carga de modelos ONNX con caché de clave/valor en versiones concretas de la librería.
- Evaluación de pipelines de conversión ONNX: útil para comparar el resultado de `optimum-cli` y `quantize_dynamic` frente a otras builds del mismo modelo, incluida la diferencia de tamaño por pesos atados.
- Experimentos de alineación a pequeña escala: al ser una variante SFT de un modelo de 135M, permite estudiar el efecto del fine-tuning supervisado frente al modelo base en tareas controladas.
- Docencia sobre cuantización: el par fp32/int8 del mismo grafo facilita medir el impacto de la cuantización dinámica en tamaño y calidad de salida sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamaño, el grafo fp32 (652,5 MB) y el int8 (164,9 MB) son compatibles con ejecución en CPU y en GPUs de gama baja.
- GPU recomendadas: no se especifican; el caso de uso declarado es la ejecución en navegador, sin GPU dedicada.
- Cabe en GPU de consumo: sí, por el reducido tamaño del modelo, aunque no se documentan requisitos mínimos concretos.
- Opciones de despliegue: Transformers.js 4.3.2 (caso de uso principal), ONNX Runtime (versión de referencia 1.20.1) y cualquier runtime compatible con ONNX opset 14.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `andrzej/smollm2-135M-SFT-Only-ONNX` | 135M | no disponible | `other` (upstream sin etiqueta) | ONNX fp32/int8 | Hugging Face, 0 descargas |
| `HuggingFaceTB/smollm2-135M-SFT-Only` | 135M | no disponible | sin etiqueta en upstream | safetensors | Hugging Face (modelo base) |
| SmolLM2-135M Instruct | 135M | no disponible | no disponible en la información | safetensors | Hugging Face |
| SmolLM2-135M (base) | 135M | no disponible | no disponible en la información | safetensors | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la única métrica disponible es la diferencia de pesos (0,008% entre SFT-Only e Instruct y 8,6% entre SFT-Only y SmolLM2-135M).

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede producir texto inexacto o inventado; el riesgo de alucinación es alto por su tamaño reducido.
- El linaje del modelo base no está confirmado: la model card y los metadatos de `SFT-Only` se contradicen, y la card de Instruct no lo menciona como base.
- La licencia es ambigua: el repositorio upstream no tiene etiqueta de licencia, por lo que el campo `other` no aclara los derechos de uso comercial. La conversión no reclama derechos adicionales.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- El fichero fp32 es un 20,8% más grande que otras builds fp32 de SmolLM2-135M (652,5 MB frente a 540 MB) por la duplicación de pesos atados, lo que puede afectar a presupuestos de memoria en entornos muy restringidos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- No apto para producción general: su propósito declarado es una demostración educativa en navegador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/andrzej/smollm2-135M-SFT-Only-ONNX
- Modelo base: https://huggingface.co/HuggingFaceTB/smollm2-135M-SFT-Only
- Revisión del modelo base usada en la conversión: `79528469cd11749bac3e8e9200fd9c192fbd8979`
