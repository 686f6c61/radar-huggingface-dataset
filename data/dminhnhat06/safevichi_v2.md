# dminhnhat06/safevichi_v2

## Resumen

SafeViChi v2 (`safevichi_v2`) es un modelo de clasificación de texto en vietnamita orientado a la moderación de contenido y la detección de discurso de odio, toxicidad y mensajes dañinos en conversaciones de 1 a 8 turnos. Lo desarrolla el autor `dminhnhat06` y se distribuye bajo licencia MIT. El modelo clasifica cada mensaje en cinco etiquetas contextuales (`AN_TOAN`, `XUC_PHAM`, `QUAY_ROI`, `DE_DOA`, `LUA_DAO`) y, además, extrae de forma literal (verbatim) los fragmentos de texto que sirven como evidencia de la clasificación, operando directamente sobre el texto original sin necesidad de un normalizador previo.

La arquitectura propietaria, denominada `SafeVi-DualORC-CRF`, parte del backbone multilingüe `jhu-clsp/mmBERT-base` (307 millones de parámetros) y le añade un codificador de bytes UTF-8 (`Byte-CNN`), un módulo `HAT`, una capa de secuencia `TurnAwareBIOCRF` sensible a los turnos de la conversación y una cabeza `ORC`. El resultado es un modelo híbrido de clasificación de secuencias que combina representaciones subword y byte-level, algo relevante para un idioma con variaciones ortográficas y ruido típico de mensajería informal.

Su interés práctico radica en el despliegue on-device: la versión por defecto es un grafo ONNX con cuantización híbrida INT8 de unos 300,69 MiB, pensado para ejecutarse en CPU de portátil con latencias de decenas de milisegundos y huella de memoria inferior a 1 GiB, lo que lo hace adecuado para moderación local sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SafeVi-DualORC-CRF: backbone mmBERT-base + Byte-CNN UTF-8 + HAT + TurnAwareBIOCRF + ORC |
| Parametros totales | 307 millones (backbone mmBERT-base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card indica conversaciones de 1 a 8 turnos) |
| Tipos de cuantizacion | ONNX FP32 y ONNX híbrida INT8 (PerRowInt8Embedding, W8A8 en Attention y mlp.Wi, W8A32 en 22 capas GeGLU mlp.Wo, cabeza DualORC-CRF en FP32) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | ONNX (INT8 y FP32), safetensors (PyTorch FP32), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo se construye sobre `jhu-clsp/mmBERT-base`, un transformer encoder multilingüe de 307 millones de parámetros, al que se incorporan componentes específicos para la tarea. El `Byte-CNN` procesa la representación UTF-8 del texto para capturar patrones ortográficos y variantes informales; el módulo `HAT` y la capa `TurnAwareBIOCRF` modelan la estructura de la conversación y la asignación de etiquetas BIO a nivel de token, mientras que la cabeza `ORC` produce la clasificación contextual de cinco clases. La combinación permite clasificar mensajes dentro de un diálogo y localizar simultáneamente los fragmentos que justifican la decisión.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos figuran como no disponibles. Sí se documenta el proceso de exportación y cuantización: se generan grafos ONNX FP32 e INT8 con verificación de errores aritméticos mediante SHA-256 en `export_manifest.json`, y se congelan parámetros de calibración (`calibration.json`) y de decodificación CRF (`crf_params.json`). La cuantización híbrida INT8 preserva la cabeza CRF en FP32 para no degradar la decodificación de evidencia.

## Capacidades

- Clasificación de texto multietiqueta en cinco categorías contextuales: seguro, ofensivo, acoso, amenaza y estafa.
- Detección de discurso de odio y toxicidad en vietnamita.
- Extracción de evidencia verbatim: devuelve los fragmentos exactos del mensaje original que sustentan la clasificación, con una tasa declarada de 0,00% de desviación respecto al texto literal.
- Procesamiento de conversaciones multi-turno (1 a 8 turnos) con modelado de dependencias entre mensajes.
- Inferencia directa sobre texto original sin normalización previa, tolerando variantes ortográficas y ruido de mensajería.
- Ejecución on-device en CPU mediante ONNX Runtime, sin requisitos de GPU.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Moderación de chats y comunidades en vietnamita: el modelo clasifica cada mensaje en cinco categorías y señala el fragmento ofensivo, lo que permite a los moderadores revisar solo los casos marcados con evidencia textual en lugar de leer hilos completos.
- Filtrado previo en aplicaciones de mensajería: integrado como paso de preprocesamiento antes de la entrega de mensajes, con latencias p50 de 24,68 ms y p95 de 31,54 ms en CPU de portátil, suficiente para filtrado en tiempo real por mensaje.
- Detección de estafas y phishing: la etiqueta `LUA_DAO` y la extracción de evidencia permiten identificar mensajes con enlaces de verificación de OTP o amenazas de bloqueo de cuenta, como el ejemplo incluido en la model card.
- Protección de menores en plataformas educativas o foros: la categoría `QUAY_ROI` (acoso) y `DE_DOA` (amenaza) habilitan alertas automáticas y escalado a revisión humana con el texto exacto que motivó la alerta.
- Moderación on-device en entornos con restricciones de privacidad: al ejecutarse localmente con unos 986 MiB de RAM pico y sin llamadas a servicios externos, el contenido sensible no abandona el dispositivo del usuario.
- Análisis retrospectivo de conversaciones: el soporte de diálogos de hasta 8 turnos y la clasificación por turno permiten auditar hilos completos y generar informes de incidentes con citas literales.
- Despliegue en hardware modesto: la versión INT8 de 300,69 MiB cabe en equipos sin GPU dedicada, lo que facilita su uso en portátiles, mini-PC o entornos de escritorio corporativos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de test bloqueado de 1.670 muestras (334 C0 + 668 C1 + 668 C2):

| Tầng đánh giá | FP32 Macro-F1 | INT8 Macro-F1 | FP32 Binary-F1 | INT8 Binary-F1 | FP32 Evidence F1 | INT8 Evidence F1 |
|---|---|---|---|---|---|---|
| C0 (limpio, n=334) | 0,8647 | 0,8598 (99,43%) | 0,9287 | 0,9333 | 0,8303 | 0,8401 |
| C1 (evasión de filtro, n=668) | 0,7859 | 0,7767 (98,83%) | 0,9029 | 0,9053 | 0,7649 | 0,7674 |
| C2 (punto ciego 100% no visto, n=668) | 0,7708 | 0,7567 (98,17%) | 0,9087 | 0,9061 | 0,7531 | 0,7630 |
| ALL (n=1.670) | 0,7960 | 0,7857 (98,71%) | 0,9104 | 0,9113 | 0,7737 | 0,7808 |

Rendimiento en CPU de portátil (AMD Ryzen AI 7 H 350, 8 hilos, batch=1, ONNX híbrido INT8): latencia p50 de 24,68 ms, p95 de 31,54 ms (41,3 mensajes/s), arranque en frío de 1,53 s, RAM pico de 986 MiB y 0,00% de fragmentos de evidencia desviados del texto original.

No se han publicado comparaciones con otros modelos de moderación en vietnamita en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para la ruta por defecto, que es inferencia en CPU vía ONNX Runtime; el grafo INT8 ocupa unos 300,69 MiB y el FP32 unos 1,15 GiB.
- RAM pico declarada: 986 MiB con la versión INT8 en CPU de 8 hilos.
- GPU recomendadas: no disponibles; el modelo está optimizado para CPU y no documenta ruta CUDA.
- Cabe en GPU de consumo: no se documenta soporte GPU; el despliegue previsto es CPU.
- Opciones de despliegue: ONNX Runtime mediante la CLI `safevichi` (INT8 por defecto, `--fp32` para FP32) y exportación propia desde los pesos `model_best.safetensors`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: p50 de 24,68 ms y p95 de 31,54 ms, con 41,3 mensajes/s en el hardware de referencia y batch=1.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de moderación en vietnamita en la información proporcionada. A modo de referencia estructural, la tabla recoge los datos conocidos del propio modelo; para alternativas de la misma categoría (clasificadores de toxicidad multilingües basados en encoders) los valores figuran como no disponibles.

| Modelo | Parámetros | Contexto | Macro-F1 (ALL) | Licencia | Formato |
|---|---|---|---|---|---|
| SafeViChi v2 (INT8) | 307 M (backbone) | no disponible (1-8 turnos) | 0,7857 | MIT | ONNX INT8/FP32, safetensors |
| Alternativas de moderación multilingües | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para vietnamita; no se documenta rendimiento en otros idiomas.
- La caída de Macro-F1 en el escenario C2 (texto nunca visto) hasta 0,7567 en INT8 indica degradación ante distribuciones fuera de dominio; conviene validar sobre datos propios antes de producción.
- La cuantización INT8 introduce una pérdida media de Macro-F1 de aproximadamente 1,29 puntos porcentuales respecto a FP32 en el conjunto ALL, aunque mejora ligeramente el Binary-F1.
- No se documentan sesgos específicos, pero al derivar de un backbone multilingüe y entrenarse sobre datos de moderación, puede heredar sesgos de anotación y sobrerrepresentar ciertas variantes léxicas.
- Riesgo de alucinación en la evidencia: aunque la model card declara 0,00% de desviación verbatim, la extracción de fragmentos depende de la decodificación CRF y puede fallar en textos con ruido extremo o mezcla de idiomas.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni garantías de exactitud.
- No hay soporte documentado de GPU, tool calling ni integración con frameworks de agentes; su uso está acotado a clasificación de texto.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dminhnhat06/safevichi_v2
- Repositorio de la CLI SafeViChi: https://github.com/thaoanhlehoang/SafeViChi
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Licencia MIT: https://opensource.org/licenses/MIT
