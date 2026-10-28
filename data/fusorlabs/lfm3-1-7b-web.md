# fusorlabs/lfm3-1.7b-web

## Resumen

`fusorlabs/lfm3-1.7b-web` no es un modelo nuevo, sino una redistribución compilada de `LiquidAI/LFM3-1.7B` empaquetada como bundle de [fusor-ai](https://github.com/fusor-rs/fusor-ai) para ejecutarse en el navegador mediante WebAssembly. El modelo subyacente es un transformer de la familia LFM3 de Liquid AI, con arquitectura tri-híbrida, 1.730 millones de parámetros y una ventana de contexto de 256.000 tokens, pensado para agentes locales y aplicaciones especializadas.

La relevancia de este artefacto es la forma de distribución: los pesos se compilan con el perfil `q7` (7 bits en las matrices grandes) y se almacenan como partes nombradas por su hash BLAKE3, verificadas en tiempo de carga por el runtime `liquidai-lmf3-wasm`. El repositorio ocupa 2,0 GB y permite celebrar una conversación de texto en la CPU del dispositivo, sin GPU ni servidor, lo que habilita casos de privacidad y despliegue offline en teléfonos y portátiles.

La contrapartida es la portabilidad: el bundle no es un checkpoint PyTorch ni safetensors y solo carga en el runtime específico `liquidai-lmf3-wasm`. Quien necesite el modelo en vLLM, llama.cpp u otro motor debe partir del repositorio base de Liquid AI, no de este.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 tri-híbrida (modelo base LiquidAI/LFM3-1.7B) |
| Parámetros totales | 1,73 mil millones |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantización | `q7` (7 bits en matrices grandes) en este bundle; el modelo base se distribuye también en 4 bits (~1 GB); detalle completo de otras cuantizaciones no disponible |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other`) |
| Formato de pesos | bundle fusor-ai: `manifest.json` + partes nombradas por hash BLAKE3; no es safetensors ni GGUF; solo carga en el runtime `liquidai-lmf3-wasm` |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea la arquitectura tri-híbrida de la familia LFM3, un diseño que Liquid AI presenta como más eficiente por parámetro: según la documentación del fabricante, supera a LFM2.5-2.6B con un 35 % menos de parámetros. La familia LFM3 está formada por seis modelos de clase 2B (texto, visión, audio, omni y decisión) entrenados sobre un backbone compartido `LFM3-1.7B-Base`; este bundle corresponde a la variante de texto. El modelo está post-entrenado para arneses agénticos como Hermes Agent, Pi y OpenClaw, lo que explica su orientación a tool calling y tareas multi-paso.

No se dispone del número de tokens de entrenamiento, la composición del dataset ni el detalle de las fases de alineación (RLHF/DPO) en la información proporcionada. La innovación técnica documentada de este artefacto concreto es el pipeline de compilación: perfil `q7`, empaquetado por partes con verificación de integridad BLAKE3 en carga y reproducción mediante `just model` en el repositorio `liquidai-lmf3-wasm`.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 256.000 tokens.
- Soporte de tool calling y function calling, según la orientación del modelo base a arneses agénticos (Hermes Agent, Pi, OpenClaw).
- Razonamiento multi-paso y ejecución de agentes locales en el dispositivo.
- Inferencia en CPU dentro del navegador mediante WebAssembly, sin backend remoto.
- Verificación de integridad de pesos en tiempo de carga (BLAKE3).
- Capacidades multilingües: no documentadas en la información disponible.
- Visión, audio o modo thinking: no disponibles en este bundle, que es de texto.

## Casos de uso

- Asistente conversacional en navegador con privacidad por diseño: el modelo se ejecuta en la CPU del cliente y los mensajes no salen del dispositivo, adecuado para aplicaciones sensibles que no pueden enviar datos a un servidor.
- Agentes web locales: con 256K de contexto y post-entrenamiento para arneses agénticos, puede gestionar tareas de navegación y automatización guiadas por instrucciones largas (el modelo base reporta 38,42 en WebArena-Verified).
- Procesamiento de documentos extensos en el cliente: contratos, informes o expedientes que caben en la ventana de 256K tokens se pueden resumir o consultar sin subirlos a la nube.
- Demos y prototipos en Hugging Face Spaces: el Space `fusorlabs/liquidai-lmf3-wasm` demuestra el despliegue WASM, útil para validar experiencias de IA on-device antes de invertir en infraestructura.
- Aplicaciones educativas u offline: al no requerir red tras la descarga inicial del bundle, encaja en entornos con conectividad intermitente o con requisitos de residencia de datos.
- Integración en herramientas de escritorio basadas en web (Electron, Tauri, PWA): el runtime WASM permite incorporar un asistente de texto sin empaquetar dependencias nativas de GPU.
- Filtrado y clasificación de texto en el borde: tareas de moderación o extracción de entidades ejecutadas localmente para reducir coste y latencia de red.

## Benchmarks y rendimiento

| Benchmark | LFM3-1.7B | LFM2.5-2.6B |
|---|---|---|
| WebArena-Verified | 38,42 | 3,02 |

Los datos anteriores proceden de la documentación y notas de prensa de Liquid AI sobre el modelo base. No se han publicado resultados de benchmarks para esta compilación `q7` en la información disponible, por lo que el impacto de la cuantización de 7 bits sobre las métricas no está cuantificado.

## Requisitos de hardware

- VRAM: no aplica; este bundle está diseñado para inferencia en CPU vía WebAssembly.
- Memoria RAM estimada: en torno a 2 GB para cargar el bundle completo (el repositorio ocupa 2,0 GB); el modelo base a 4 bits requiere aproximadamente 1 GB, por lo que la versión `q7` es más exigente.
- GPU recomendadas: ninguna para este artefacto; el modelo base puede ejecutarse en GPU, pero no se dispone de requisitos detallados en la información proporcionada.
- Compatibilidad consumer: cabe en teléfonos y portátiles modernos según las cifras del fabricante para el modelo base; la compilación `q7` requiere más memoria que la de 4 bits.
- Despliegue: runtime `liquidai-lmf3-wasm` y ecosistema `fusor-ai`; el Space `fusorlabs/liquidai-lmf3-wasm` sirve como referencia. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WebArena-Verified | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| lfm3-1.7b-web (este) | 1,73 B | 256K | 38,42 (modelo base) | LFM Open License v1.0 | Bundle fusor-ai para WASM; solo runtime `liquidai-lmf3-wasm` |
| LFM3-VL-2B web (hermano multimodal) | clase 2B (dato exacto no disponible) | no disponible | no disponible | familia LFM3 (consultar) | Bundle fusor-ai para WASM; conversación sobre imágenes |
| LFM2.5-2.6B (generación anterior) | 2,6 B | no disponible en la información | 3,02 | no disponible | Checkpoint estándar de Liquid AI; no disponible el detalle |

La comparación con modelos de otros fabricantes (Qwen, Gemma, Llama de tamaño similar) no se incluye porque la información proporcionada no aporta sus especificaciones ni métricas verificables.

## Limitaciones y advertencias

- Portabilidad nula: el bundle solo carga en el runtime `liquidai-lmf3-wasm`; no se puede usar con PyTorch, vLLM, llama.cpp ni Ollama.
- Cuantización `q7`: la pérdida de calidad frente al modelo en precisión completa no está medida ni documentada.
- Escala 1,7B: capacidad de razonamiento limitada frente a modelos mayores; riesgo de alucinación inherente a este tamaño, especialmente en dominios especializados.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe homogéneo.
- Contexto de 256K: aunque la ventana es amplia, la memoria y la latencia en navegador pueden degradarse con entradas muy largas; no hay cifras publicadas.
- Licencia LFM Open License v1.0, etiquetada como `other` y no OSI: es imprescindible revisar los términos antes de uso comercial, ya que pueden existir restricciones no reflejadas en la model card.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la ficha, con publicación reciente; la validación comunitaria es inexistente.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del corpus de entrenamiento, no disponibles.
- La puntuación de 38,42 en WebArena-Verified, aunque superior a la generación anterior, sigue siendo modesta en términos absolutos para tareas agénticas complejas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusorlabs/lfm3-1.7b-web
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio del runtime: https://github.com/fusor-rs/liquidai-lmf3-wasm
- Ecosistema fusor-ai: https://github.com/fusor-rs/fusor-ai
- Demo en Space: https://huggingface.co/spaces/fusorlabs/liquidai-lmf3-wasm
- Modelo hermano multimodal: https://huggingface.co/fusorlabs/lfm3-vl-2b-web
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Blog de presentación de LFM3: https://www.liquid.ai/blog/lfm3
- Cobertura de MarkTechPost: https://www.marktechpost.com/2026/10/27/liquid-ai-lfm3-open-weight-2b-multimodal-models/
- Cobertura de AI Tools Oasis: https://www.aitoolsoasis.com/en/news/liquid-ai-launches-lfm3-17b-multimodal-models-with-256k-1793131323743
