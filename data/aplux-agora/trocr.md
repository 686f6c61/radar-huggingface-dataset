# APLUX-Agora/TrOCR

## Resumen

TrOCR es un modelo de reconocimiento óptico de caracteres (OCR) de tipo image-to-text publicado por APLUX-Agora dentro de su plataforma Agora, orientada a despliegue en hardware Qualcomm para escenarios AIoT. El modelo sigue la arquitectura TrOCR original (encoder de visión tipo ViT combinado con un decoder autorregresivo basado en transformer) y está empaquetado como recursos convertidos y ejecutables sobre el SoC QCS8550, con binarios QNN y metadatos de despliegue por precisión.

El repositorio no contiene pesos en formato estándar (safetensors, GGUF), sino artefactos de despliegue organizados en `targets/<SoC>/`, con un `model.json` que define la precisión por defecto y las rutas de cada variante, además de binarios `model.bin` para el contexto. La tarea declarada es reconocimiento de texto corto en inglés, con salida de texto y un JSON auxiliar que preserva los tokens generados completos para su exportación.

Su relevancia es acotada pero específica: cubre el nicho de OCR en el borde (edge) sobre placas Qualcomm reales, con una latencia medida de 77,5 ms en FP16 sobre la placa Rhino Pi X1 con QCS8550. No es un modelo de propósito general ni compite en benchmarks de razonamiento; es un componente de pipeline para digitalización de texto en dispositivos empotrados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder de visión + decoder autorregresivo transformer); empaquetado QNN para Qualcomm |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (precisión por defecto y única medida reportada en QCS8550) |
| Idiomas soportados | inglés (texto corto, según la model card) |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); modelo fuente sujeto a sus propios términos |
| Formato de pesos | binarios QNN (`model.bin`) y `model.json` por SoC; no hay safetensors ni GGUF publicados |

## Arquitectura y entrenamiento

La model card describe un modelo con encoder y decoder carácter a carácter ("逐字解码器") para reconocimiento de texto corto en inglés, lo que corresponde al esquema TrOCR: un encoder visual que procesa la imagen y un decoder transformer que genera la secuencia de texto token a token. El repositorio no detalla el tamaño del encoder, el número de capas, la resolución de entrada ni el vocabulario.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens, el uso de RLHF/DPO ni técnicas de optimización como decodificación especulativa. Lo que sí está documentado es el proceso de conversión y empaquetado: los recursos se organizan por SoC y precisión, con binarios de contexto QNN listos para ejecución en placas Qualcomm, y se conservan los tokens de generación completos para permitir la exportación del grafo. El preprocesado, postprocesado y el runner se obtienen desde la plataforma Agora (sección "部署指南" o exportando un workflow que use el modelo).

## Capacidades

- Reconocimiento de texto en imágenes (OCR) para texto corto en inglés.
- Salida de texto plano más una salida JSON (`out`) que preserva los tokens generados completos.
- Entrada de imagen única; no se documentan entradas multimodales adicionales.
- Ejecución en el borde sobre SoC Qualcomm QCS8550 mediante binarios QNN.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- Capacidad multilingüe: no disponible; la model card solo menciona inglés.

## Casos de uso

- Digitalización de etiquetas y códigos en dispositivos AIoT: el modelo reconoce texto corto en imágenes capturadas por cámaras de placas QCS8550, con 77,5 ms por inferencia en FP16, adecuado para lectura de etiquetas en línea de producción.
- Lectura de matrículas o identificadores en cámaras empotradas: al ejecutarse íntegramente en el SoC, evita enviar imágenes a la nube y reduce latencia y consumo de red en instalaciones con conectividad limitada.
- Extracción de texto de tickets y comprobantes en terminales de punto de venta: la salida JSON con tokens completos facilita el postprocesado y la integración con sistemas de facturación.
- Automatización de inventario en almacén: lectura de referencias y números de serie en entornos con poca iluminación controlada, donde un OCR local elimina la dependencia de servicios externos.
- Preprocesado en pipelines de documentos escaneados: como primer paso de OCR para recortes de texto corto, alimentando etapas posteriores de parsing o indexación.
- Prototipado y evaluación en la plataforma Agora: permite probar el modelo online sin placa física y exportar el workflow completo, lo que acelera la validación antes de desplegar en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento medido es la latencia de inferencia en la placa Rhino Pi X1 con SoC QCS8550:

| SoC · placa | Precisión | Latencia medida en Agora |
|---|---|---|
| QCS8550 · Rhino Pi X1 | FP16 | 77,5 ms |

No se reportan métricas de precisión de OCR (CER, WER, exactitud) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU de escritorio; el modelo está empaquetado para ejecución en el NPU/SoC Qualcomm QCS8550 mediante QNN.
- GPU recomendadas: no disponibles; el target documentado es el SoC QCS8550 (placa Rhino Pi X1).
- Cabe en GPU de consumo: no disponible; no se publican pesos en formatos estándar para ejecución en GPU convencional.
- Opciones de despliegue: binarios QNN a través de la plataforma Agora (descarga con `hf download` filtrando por `targets/<SoC>/*`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 77,5 ms por inferencia en FP16 sobre QCS8550 (precisión por defecto). Throughput no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables (parámetros, contexto, precisión) en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de OCR como TrOCR original, PaddleOCR o EasyOCR.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| APLUX-Agora/TrOCR | no disponible | no disponible | APLUX Model Farm License | Hugging Face (recursos QNN) |
| TrOCR original (Microsoft) | no disponible en esta ficha | no disponible | no disponible | no disponible |
| Alternativas OCR genéricas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se documenta reconocimiento de texto corto en inglés; no hay evidencia de soporte multilingüe ni de texto denso o manuscrito.
- No se publican métricas de precisión (CER/WER); el rendimiento real en producción no puede estimarse a partir de la información disponible.
- Riesgo de alucinación en la generación de texto: al ser un decoder autorregresivo, puede producir caracteres plausibles pero incorrectos en imágenes de baja calidad.
- Licencia restrictiva: los recursos convertidos están sujetos a la APLUX Model Farm License, y el modelo fuente a sus propios términos; es necesario revisar `LICENSE_MODEL_FARM.pdf` y `NOTICE.md` antes de cualquier uso comercial.
- Los pesos no se distribuyen en formatos estándar (safetensors, GGUF), lo que limita su uso fuera del ecosistema Agora/QNN y dificulta la auditoría y la reproducibilidad.
- Dependencia de la plataforma Agora para el preprocesado, postprocesado y el runner; el repositorio de 0,1 GB contiene únicamente artefactos de despliegue.
- No se documentan sesgos específicos, pero al estar entrenado presumiblemente con datos en inglés, el rendimiento en otros alfabetos o estilos tipográficos es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/TrOCR
- Prueba online en Agora: https://mega.aidlux.com/models/trocr
- Plataforma Agora: https://mega.aidlux.com
- Licencia del modelo: https://huggingface.co/APLUX-Agora/TrOCR/blob/main/LICENSE_MODEL_FARM.pdf
