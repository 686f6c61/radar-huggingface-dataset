# GatekeeperZA/InternVL3.5-4B-Instruct-RKLLM-v1.2.3

## Resumen

InternVL3.5-4B-Instruct-RKLLM-v1.2.3 es una conversión del modelo de visión-lenguaje InternVL3-4B de OpenGVLab (Shanghai AI Lab) al formato RKLLM/RKNN, desarrollada por GatekeeperZA para su ejecución en la NPU del SoC Rockchip RK3588. El modelo original combina un codificador de visión con un modelo de lenguaje de 4 000 millones de parámetros, y esta conversión aplica cuantización w8a8 (pesos y activaciones de 8 bits) para reducir el uso de memoria y permitir inferencia en placas de bajo consumo como la Orange Pi 5 Plus, sin necesidad de GPU.

La relevancia de esta ficha radica en que demuestra cómo un VLM multimodal de tamaño medio puede desplegarse en hardware de borde (edge) con un consumo energético mínimo, manteniendo capacidades de comprensión de imágenes, respuesta a preguntas visuales y OCR. El autor reporta que el modelo carga aproximadamente 5,5 GB en RAM y funciona con el runtime RKLLM v1.2.3, lo que lo convierte en una opción práctica para aplicaciones embebidas que requieran análisis visual local y privado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-MLP-LLM (vision transformer + proyector MLP + LLM) |
| Parametros totales | 4 000 millones (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | w8a8 (8-bit pesos, 8-bit activaciones) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | .rkllm (modelo de lenguaje) y .rknn (codificador de vision) |

## Arquitectura y entrenamiento

El modelo base InternVL3-4B sigue el paradigma ViT-MLP-LLM: un codificador de vision basado en transformer (InternViT) procesa las imagenes, un proyector MLP alinea las representaciones visuales con el espacio del modelo de lenguaje, y un LLM (inicializado desde Qwen3 en la familia InternVL3.5, aunque el modelo base concreto no especifica el origen) genera las respuestas. La conversion a RKLLM mantiene esta arquitectura, pero aplica cuantizacion w8a8 para adaptarse a las capacidades de la NPU del RK3588, que soporta operaciones de 8 bits de forma eficiente.

Los datos de entrenamiento del modelo original no se detallan en la informacion proporcionada. La model card del autor indica que la conversion se realizo con RKLLM Toolkit v1.2.3 para el modelo de lenguaje y RKNN Toolkit para el codificador de vision, sin modificaciones en los pesos mas alla de la cuantizacion. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales tras la conversion.

## Capacidades

- Comprension de imagenes: analisis de contenido visual, objetos, escenas y relaciones espaciales.
- Respuesta a preguntas visuales (VQA): responde preguntas sobre el contenido de una imagen.
- OCR: extraccion de texto de imagenes y documentos escaneados.
- Comprension de graficos y documentos: interpretacion de tablas, diagramas y graficos estadisticos.
- Multilingue: soporte nativo de ingles y chino, con capacidad de mezclar ambos idiomas en una conversacion.
- Ejecucion en NPU: inferencia optimizada para el hardware Rockchip RK3588, sin necesidad de GPU.
- Sin modo de pensamiento (thinking mode): el autor indica que no es aplicable en esta conversion.

## Casos de uso

- Asistentes visuales en dispositivos embebidos: un robot o camara inteligente puede capturar una imagen y pedir al modelo que describa la escena o identifique objetos, ejecutandose localmente en una placa RK3588 sin conexion a la nube.
- OCR en entornos industriales: lectura de etiquetas, matricula o numeros de serie en lineas de produccion, con el modelo corriendo en tiempo real sobre la NPU.
- Analisis de documentos para archivado automatico: el modelo extrae texto e informacion estructurada de facturas o formularios escaneados, facilitando su indexacion en bases de datos locales.
- Accesibilidad para personas con discapacidad visual: una aplicacion movil o dispositivo dedicado puede describir el entorno capturado por la camara, usando el modelo como motor de descripcion de imagenes.
- Clasificacion de imagenes con lenguaje natural: en un sistema de vigilancia, el modelo puede responder a preguntas como "¿hay alguna persona en la imagen?" o "¿que color es el vehiculo?", sin necesidad de entrenar clasificadores especificos.
- Demostraciones educativas y de investigacion: sirve como plataforma para experimentar con VLM en hardware de bajo coste, permitiendo probar tecnicas de prompt engineering o fine-tuning en un entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o VQAv2, ni comparaciones cuantitativas con otros modelos. El unico dato de rendimiento mencionado es el de un modelo hermano (InternLM2-1.8B) que alcanza ~15,6 tokens/seg en la misma placa, pero no es aplicable a este VLM.

## Requisitos de hardware

- Placa objetivo: RK3588 o RK3588S (no compatible con RK3576 sin reconversion).
- RAM: aproximadamente 5,5 GB cargados en memoria. Se recomienda placa con 8 GB o mas (16 GB recomendado).
- NPU: 3 nucleos del RK3588, con driver RKNPU ≥ 0.9.6.
- Runtime: RKLLM Runtime v1.2.1 o superior (recomendado v1.2.3) y RKNN Runtime v2.x.
- Software de despliegue: RKLLM API Server (repositorio de GatekeeperZA) que carga automaticamente los archivos .rkllm y .rknn, ofreciendo una API compatible con OpenAI para integrarse con Open WebUI u otros frontends.
- Hardware probado: Orange Pi 5 Plus con 16 GB RAM y Armbian Linux.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. La model card menciona a Qwen3-VL-4B como alternativa, indicando que InternVL tiene un linaje de entrenamiento distinto y destaca en analisis denso de imagenes y comprension de graficos/documentos, pero no se aportan cifras concretas. Otras alternativas en el mismo rango de parametros (como LLaVA-1.6 o Phi-3-vision) no estan cubiertas por la informacion disponible. Por tanto, la comparativa queda limitada a una valoracion cualitativa basada en la descripcion del autor.

## Limitaciones y advertencias

- Idiomas limitados: solo ingles y chino; no soporta otros idiomas de forma nativa.
- Sin modo de pensamiento: no puede realizar razonamiento encadenado explicito, lo que puede afectar a tareas complejas de razonamiento visual.
- Requisitos de runtime especificos: necesita RKLLM Runtime v1.2.1+ y RKNN Runtime v2.x; versiones anteriores pueden no ser compatibles.
- Hardware restringido: solo funciona en RK3588/RK3588S; no es portable a otras NPU sin reconversion.
- Riesgo de alucinacion visual: como cualquier VLM, puede generar descripciones inexactas o inventar detalles no presentes en la imagen.
- Uso en produccion: la cuantizacion w8a8 puede degradar ligeramente la precision respecto al modelo en punto flotante, especialmente en tareas de OCR fino o reconocimiento de objetos pequenos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base (InternVL3) puede tener restricciones adicionales; se recomienda revisar la licencia del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GatekeeperZA/InternVL3.5-4B-Instruct-RKLLM-v1.2.3
- Modelo base original: https://huggingface.co/OpenGVLab/InternVL3-4B
- Repositorio RKLLM API Server: https://github.com/GatekeeperZA/RKLLM-API-Server
- Blog oficial de InternVL3.5: https://internvl.github.io/blog/2025-08-26-InternVL-3.5/
- Repositorio de la familia InternVL: https://github.com/OpenGVLab/InternVL
