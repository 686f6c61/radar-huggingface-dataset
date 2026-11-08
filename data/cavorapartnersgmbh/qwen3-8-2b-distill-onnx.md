# CavoraPartnersGmbH/Qwen3.8-2B-Distill-ONNX

## Resumen

Qwen3.8-2B-Distill-ONNX es la exportación a formato ONNX del modelo empero-ai/Qwen3.8-2B-Distill, un destilado de parámetros completos del modelo docente Qwen3.8 2.4T A95B (un MoE de gran escala) sobre la arquitectura del alumno Qwen3.5-2B, el miembro más pequeño de la familia. El resultado es un modelo denso de aproximadamente 2.270 millones de parámetros, pensado para ejecutarse en el navegador mediante transformers.js, con WebGPU (cuantización q4f16) o WebAssembly (q4). La exportación la ha realizado Cavora Partners GmbH para uso local en su producto CavoraAI.

El interés de esta ficha radica en dos factores. Por un lado, el modelo base destilado incorpora trazas de razonamiento en cadena (chain-of-thought) densas procedentes del docente, orientadas a matemáticas, razonamiento general y seguimiento de instrucciones. Por otro, esta versión ONNX traslada ese comportamiento a un entorno de inferencia puramente cliente (navegador), sin servidor ni GPU dedicada, con un tamaño de repositorio de 2,9 GB.

Se trata de una exportación sin cambios en los pesos más allá de la conversión a ONNX y la cuantización a 4 bits. La licencia Apache 2.0 se mantiene igual que en el modelo de origen. No hay datos publicados sobre idiomas soportados más allá de la indicación del autor de que el modelo fuente declara inglés y que el alemán funcionó bien en sus pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5-2B), exportado a ONNX |
| Parametros totales | ~2.270 millones (2,27 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4f16 (WebGPU), q4 (WebAssembly) |
| Idiomas soportados | No disponible (el modelo fuente declara inglés; el autor reporta buen funcionamiento en alemán) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo base es un destilado de parámetros completos de Qwen3.8 2.4T A95B (un mixture-of-experts de 2,4 billones de parámetros totales y 95.000 millones activos) hacia la arquitectura densa de Qwen3.5-2B. El alumno se entrenó con el mismo currículo que sus hermanos mayores y vio aproximadamente 30.000 trazas docentes curadas de los conjuntos internos de destilación de Qwen3.8: cadenas de pensamiento densas que abarcan matemáticas, razonamiento general y seguimiento de instrucciones. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La versión de este repositorio no modifica los pesos: solo aplica la conversión a ONNX y la cuantización a 4 bits, manteniendo el mismo diseño y esquema de cuantización que los modelos Qwen 3.5 publicados por onnx-community. El autor indica que comparó las salidas contra el modelo fuente en una comprobación sobre CPU. La etiqueta `qwen3_5` y la modalidad `image-text-to-text` aparecen en los tags del repositorio, aunque la model card no documenta capacidades de visión; conviene tratar ese extremo como no confirmado.

## Capacidades

- Generación de texto conversacional y de instrucciones, con pipeline declarado `text-generation`.
- Razonamiento en cadena de pensamiento (chain-of-thought) heredado del proceso de destilación del docente, orientado a matemáticas, razonamiento general y seguimiento de instrucciones.
- Ejecución en navegador mediante transformers.js, con backend WebGPU (q4f16) o WebAssembly (q4).
- Muestreo recomendado por el autor del modelo fuente: temperature 0.6, top_p 0.95, top_k 20.
- Soporte multilingüe: no documentado; el modelo fuente declara inglés y el exportador reporta resultados correctos en alemán.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking explícito: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en el navegador: el modelo se ejecuta íntegramente en cliente con transformers.js y WebGPU, de modo que se puede ofrecer un chat sin enviar datos a un servidor, útil para aplicaciones con requisitos de privacidad estrictos.
- Demos y prototipos de razonamiento matemático: al haber sido destilado sobre trazas de chain-of-thought del docente, permite mostrar pasos intermedios en aplicaciones educativas o de verificación de cálculos, siempre con validación posterior.
- Aplicaciones web offline o de baja conectividad: al empaquetarse como pesos ONNX cuantizados a 4 bits, puede servirse desde caché del navegador o como recurso local en entornos sin acceso a APIs externas.
- Procesamiento de texto en el borde (edge): integrable en extensiones de navegador o aplicaciones de escritorio basadas en WebAssembly para tareas de resumen, reescritura o clasificación sin infraestructura de GPU.
- Evaluación comparativa de destilados pequeños: sirve como referencia para medir cuánto del comportamiento del docente Qwen3.8 2.4T A95B se conserva en un alumno de 2,27 B en tareas de razonamiento e instrucciones.
- Generación de texto en alemán dentro de productos europeos: el exportador reporta buen comportamiento en alemán, lo que lo hace candidato para interfaces conversacionales en ese idioma, con la cautela de que no hay evaluación formal publicada.
- Base para ajuste fino o experimentación en local: los pesos ONNX y la licencia Apache 2.0 permiten su uso y modificación en pipelines de investigación sin restricciones comerciales adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 2,9 GB y las variantes cuantizadas a 4 bits reducen el peso muy por debajo de los ~4,5 GB que ocuparían los pesos en FP16.
- GPU recomendadas: no disponibles; el diseño apunta a ejecución en navegador con WebGPU, por lo que el hardware objetivo es la GPU integrada o dedicada del cliente final.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño de 2,27 B y la cuantización a 4 bits, aunque no se especifican modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: transformers.js con WebGPU (q4f16) y WebAssembly (q4); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta exportación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-2B-Distill-ONNX (este) | ~2,27 B denso | No disponible | ONNX (q4f16, q4) | Apache 2.0 | Exportación para navegador vía transformers.js |
| empero-ai/Qwen3.8-2B-Distill | ~2,27 B denso | No disponible | No disponible | No disponible | Modelo fuente del que deriva esta exportación |
| Qwen/Qwen3.5-2B | ~2 B (arquitectura alumno) | No disponible | No disponible | No disponible | Arquitectura base sobre la que se destila |
| Qwen 3.5 ONNX de onnx-community | ~2 B | No disponible | ONNX | No disponible | Mismo esquema de cuantización y diseño que esta exportación |

Los datos de contexto, licencia y benchmarks de las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones formales de sesgo, alucinación o robustez para esta exportación ni para su modelo fuente en la información disponible.
- El modelo fuente declara únicamente inglés; el buen comportamiento en alemán es una observación informal del exportador, sin evaluación sistemática.
- La cuantización a 4 bits puede degradar la calidad respecto a los pesos originales; el autor solo menciona una comparación de salidas sobre CPU contra el modelo fuente, sin métricas publicadas.
- La longitud de contexto no está documentada, lo que impide planificar aplicaciones con ventanas largas sin verificación empírica.
- Los tags del repositorio incluyen `image-text-to-text`, pero la model card no describe capacidades de visión; no debe asumirse soporte multimodal sin comprobación.
- El repositorio no está afiliado ni al equipo de Qwen ni a Empero; el soporte y las actualizaciones dependen de Cavora Partners GmbH.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar el fichero `LICENSE` del repositorio y la licencia del modelo fuente antes de desplegar en producción.
- El rendimiento en navegador depende del soporte de WebGPU del cliente; en equipos sin esa API se recurre a WebAssembly (q4), con mayor latencia esperada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CavoraPartnersGmbH/Qwen3.8-2B-Distill-ONNX
- Modelo fuente (destilado): https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Árbol de ficheros del modelo fuente: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill/tree/main
- Modelo base de arquitectura: https://huggingface.co/Qwen/Qwen3.5-2B
