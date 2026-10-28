# fusorlabs/lfm3-vl-2b-web

## Resumen

`fusorlabs/lfm3-vl-2b-web` no es un checkpoint nuevo, sino una compilación del modelo vision-lenguaje `LiquidAI/LFM3-VL-2B` de Liquid AI empaquetada en un bundle del runtime `fusor-ai` para ejecutarse en el navegador sobre la CPU del dispositivo. El paquete se generó a partir de la revisión `f83d2b0a2296aaa277f394990a9b8b949ddf9691` del modelo original con el perfil de cuantización `q7`: todas las matrices grandes a 7 bits, salvo el patch embedding, que se mantiene en f32. El repositorio ocupa 2,2 GB.

El modelo subyacente pertenece a la familia LFM3 de Liquid AI y combina un backbone de lenguaje LFM3 con un codificador visual propio de convolución/atención híbrida, capaz de procesar texto, imágenes y vídeo a resolución nativa. Está diseñado para despliegue on-device en tareas de comprensión visual: lectura de documentos, gráficas y pantallas de aplicaciones, localización de objetos y razonamiento espacial.

La relevancia de este artefacto es de infraestructura, no de investigación: demuestra un pipeline de compilación reproducible (`just model` en el repositorio `liquidai-lmf3-wasm`) que convierte pesos de un VLM de 2B en un binario cargable por WebAssembly, con verificación de integridad mediante hashes BLAKE3 por cada parte del bundle. El precio es la portabilidad: el formato es propietario del runtime y no se puede abrir con PyTorch, safetensors, llama.cpp ni vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje: backbone de lenguaje LFM3 + codificador visual híbrido convolución/atención de Liquid AI (detalle de capas no disponible) |
| Parametros totales | 2B (el modelo base se publica como LFM3-VL-2B; una fuente secundaria de terceros cita 1,92 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Perfil `q7` del bundle: matrices grandes a 7 bits, patch embedding en f32. Otros perfiles no disponibles |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | Bundle `fusor-ai`: `manifest.json` + partes nombradas por su hash BLAKE3. No es safetensors, GGUF ni PyTorch |

Otros datos del repositorio: tamaño de 2,2 GB, `library_name: fusor-ai`, `pipeline_tag: image-text-to-text`, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-28.

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B empareja el backbone de lenguaje de la familia LFM3 con un codificador visual propio basado en una mezcla híbrida de convolución y atención. Procesa texto, imágenes y vídeo a resolución nativa, sin reescalado obligatorio a una resolución fija, lo que reduce la pérdida de detalle en documentos densos y capturas de pantalla. Según una fuente secundaria (AI/TLDR), el entrenamiento del modelo original habría seguido las etapas de mid-training y SFT visual, RL visual y, finalmente, destilación on-policy a partir del modelo de RL mixto de LFM3-1.7B; esta descripción no está confirmada en la model card disponible.

La aportación específica de este repositorio es el empaquetado. La compilación con el perfil `q7` aplica cuantización a 7 bits a todas las matrices grandes y preserva el patch embedding en f32, presumiblemente para no degradar la proyección inicial de los parches visuales. Cada tensor y cada parte del bundle se referencia en `manifest.json` por su hash BLAKE3, y el runtime verifica ese hash durante la carga, lo que da integridad verificable de extremo a extremo. La reproducibilidad está cubierta por el comando `just model` del repositorio `liquidai-lmf3-wasm`, que descarga el checkpoint y recompila el mismo bundle.

## Capacidades

- Generación de texto e `image-text-to-text`: conversación multi-turno sobre imágenes.
- Entrada de vídeo además de imagen y texto, procesados a resolución nativa (según la documentación de Liquid AI).
- Lectura de documentos, gráficas, diagramas y capturas de pantalla de aplicaciones.
- Localización de objetos en imagen y razonamiento espacial, orientado a robótica y tareas de percepción.
- Modo de razonamiento conmutables: una fuente secundaria reporta resultados distintos con *thinking* activado y desactivado.
- Ejecución on-device en CPU dentro del navegador mediante WebAssembly, sin dependencia de servidor de inferencia.
- Verificación de integridad de los pesos en tiempo de carga mediante hashes BLAKE3.
- Soporte de tool calling / function calling, agentes multi-paso y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Asistentes de accesibilidad en el navegador**: describir imágenes y responder preguntas sobre ellas sin enviar el contenido a un servidor, aprovechando que el bundle se ejecuta en la CPU del cliente.
- **Procesamiento de documentos sensibles en local**: facturas, contratos o informes médicos que no pueden salir del dispositivo; el modelo lee documentos a resolución nativa y evita el coste de cumplimiento de subir imágenes a la nube.
- **Soporte in-app sobre capturas de pantalla**: el usuario adjunta una captura de la aplicación y el modelo identifica el error, el menú o el campo relevante, al ejecutarse dentro del propio runtime web.
- **Demostraciones y pruebas de concepto sin backend**: prototipos de producto que necesitan visión-lenguaje y no quieren desplegar infraestructura GPU; el Space `fusorlabs/liquidai-lmf3-wasm` sirve como referencia.
- **Análisis de gráficas y paneles de datos**: extracción de tendencias y valores de gráficos en herramientas de analítica web, con independencia de que el usuario tenga GPU.
- **Percepción para robótica y prototipado de bajo coste**: razonamiento espacial y localización de objetos sobre fotogramas, útil en iteraciones de laboratorio donde se prioriza la ausencia de dependencias frente a la latencia.
- **Despliegue en entornos con red restringida o air-gapped**: al ser un bundle autocontenido y verificable por hash, se puede servir desde un CDN interno sin exponer pesos a servicios externos.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de una fuente secundaria (blog de orcarouter.ai) y no aparecen verificados en la model card consultada. Se refieren al modelo base, no al bundle compilado.

| Metrica | Resultado | Fuente |
|---|---|---|
| Media en 62 benchmarks de visión | 71,4 | orcarouter.ai (terceros) |
| Media en 62 benchmarks de visión, sin *thinking* | 62,1 | orcarouter.ai (terceros) |
| MMLU / HumanEval / GSM8K | no disponible | — |
| Comparación directa con predecesor de 3,1B | reportada como favorable al modelo de 1,92B (cifras por métrica no disponibles) | orcarouter.ai (terceros) |

No se han publicado resultados de benchmarks del bundle cuantizado a 7 bits en la información disponible, por lo que se desconoce la degradación introducida por la cuantización.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el runtime de `liquidai-lmf3-wasm` ejecuta la inferencia en CPU mediante WebAssembly.
- **Memoria del dispositivo**: el bundle pesa 2,2 GB en disco o caché; se puede estimar un consumo de RAM en el rango de 2,5-3,5 GB durante la carga y la inferencia (estimación propia, no confirmada por el autor).
- **GPU recomendadas**: no aplica para este artefacto. Para el modelo base en precisión completa sí se necesitaría GPU, pero no se dispone de cifras en la información proporcionada.
- **¿Cabe en GPU de consumo?**: el modelo base de 2B es apto para GPU de consumo en cuantizaciones de 4-8 bits; este bundle concreto no está pensado para ellas.
- **Opciones de despliegue**: runtime `liquidai-lmf3-wasm` (navegador), Space de demostración `fusorlabs/liquidai-lmf3-wasm`; el modelo base está disponible también en la librería de Ollama como `lfm3-vl`. vLLM, TGI y llama.cpp no pueden cargar este formato.
- **Latencia y throughput**: no disponible. Al ejecutarse en CPU y en WASM, es previsible una latencia notablemente superior a la de una GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fusorlabs/lfm3-vl-2b-web` | 2B | no disponible | Bundle fusor-ai (7 bits) | LFM Open License v1.0 | Solo runtime liquidai-lmf3-wasm |
| `LiquidAI/LFM3-VL-2B` (original) | 2B (1,92B según terceros) | no disponible | Pesos originales del autor | LFM Open License v1.0 | HuggingFace, Ollama (`lfm3-vl`) |
| Alternativas de ~2B con visión (SmolVLM2, Qwen2.5-VL-3B, etc.) | no disponible en la información consultada | no disponible | no disponible | no disponible | no disponible |

La comparación relevante aquí es de formato y despliegue, no de calidad: este repositorio y el checkpoint original comparten pesos y licencia, y se diferencian en la cuantización (7 bits frente a la precisión original) y en el runtime. No se dispone de datos verificados para comparar con otros VLM on-device de tamaño similar.

## Limitaciones y advertencias

- **Formato cerrado al runtime**: el bundle solo carga en `liquidai-lmf3-wasm`. No es utilizable con PyTorch, transformers, llama.cpp, Ollama ni vLLM; la model card lo indica explícitamente.
- **Cuantización a 7 bits**: no hay datos publicados sobre la pérdida de precisión frente al checkpoint original, especialmente en tareas de OCR fino y lectura de gráficas.
- **Riesgo de alucinación**: como todo VLM, puede inventar texto en documentos poco legibles o atribuir valores incorrectos a ejes de gráficas; no se han publicado evaluaciones de fidelidad en este bundle.
- **Ausencia de validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no existen informes independientes sobre el comportamiento del bundle.
- **Benchmarks no verificados**: la cifra de 71,4 en 62 benchmarks de visión proviene de un blog de terceros, no de la model card.
- **Licencia**: LFM Open License v1.0, una licencia propia (marcada como `other` en HuggingFace), no una licencia OSI. Las condiciones concretas de uso comercial no se detallan en la información disponible y deben revisarse en el fichero `LICENSE` del repositorio y del modelo base.
- **Idiomas y contexto**: sin datos publicados sobre cobertura lingüística ni longitud de contexto, lo que impide garantizar comportamiento multilingüe o conversaciones largas.
- **Rendimiento en CPU/WASM**: al no haber cifras de latencia, no se puede garantizar una experiencia interactiva en hardware modesto, especialmente con vídeo o imágenes de alta resolución.
- **Fechas del repositorio**: creado y actualizado el 2026-10-28, con una diferencia de 50 segundos entre ambos eventos, lo que sugiere una publicación automatizada sin revisión posterior.

## Enlaces

- Repositorio del bundle: https://huggingface.co/fusorlabs/lfm3-vl-2b-web
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Demo en Space: https://huggingface.co/spaces/fusorlabs/liquidai-lmf3-wasm
- Runtime del navegador: https://github.com/fusor-rs/liquidai-lmf3-wasm
- Herramienta de empaquetado: https://github.com/fusor-rs/fusor-ai
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm3-vl-2b
- Entrada en Ollama: https://ollama.com/library/lfm3-vl
- Análisis de terceros con benchmarks: https://www.orcarouter.ai/blog/lfm3-vl-2b-release
- Ficha de terceros sobre el entrenamiento: https://ai-tldr.dev/models/lfm3-vl-2b/
