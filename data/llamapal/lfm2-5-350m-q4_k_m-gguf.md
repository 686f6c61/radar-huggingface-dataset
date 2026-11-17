# LlamaPal/LFM2.5-350M-Q4_K_M-GGUF

## Resumen

LFM2.5-350M-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo LFM2.5-350M desarrollado por Liquid AI, publicada y distribuida por el usuario LlamaPal como espejo (mirror) del archivo original. El modelo base es un transformer de 354.483.968 parámetros (aproximadamente 350 millones) orientado a generación de texto conversacional, pensado para ejecutarse en dispositivos con recursos muy limitados, como teléfonos Android.

El archivo concreto de este repositorio es una copia sin modificar del `LFM2.5-350M-Q4_K_M.gguf` publicado por Liquid AI en `LiquidAI/LFM2.5-350M-GGUF`, con el mismo hash SHA-256, y ocupa 229 MB en cuantización Q4_K_M. Su relevancia radica en que permite inferencia completamente offline en hardware móvil de gama media, sin conexión a internet ni cuentas de usuario, lo que lo convierte en una opción práctica para aplicaciones de chat local en Android.

La ficha se centra en el archivo cuantizado y su uso práctico; los detalles de arquitectura y entrenamiento del modelo original no están documentados en la información disponible y se indican como no disponibles cuando corresponde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5-350M de Liquid AI; no se detalla en la información proporcionada) |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); el repositorio contiene únicamente esta cuantización |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como `other` / `lfm1.0`) |
| Formato de pesos | GGUF (`LFM2.5-350M-Q4_K_M.gguf`, 229 MB, SHA-256 `7e6f72643caafc9a68256686638c4d7916f2cec76d1df478d4c3ddcd95a6aed4`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base LFM2.5-350M más allá de su naturaleza de modelo de generación de texto conversacional. No se detallan el tipo de transformer, la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del modelo original en la información proporcionada.

El artefacto de este repositorio es una cuantización Q4_K_M realizada con llama.cpp sobre los pesos originales de Liquid AI. El autor del espejo indica explícitamente que se trata de una copia sin modificar, byte a byte, del archivo publicado en el repositorio oficial `LiquidAI/LFM2.5-350M-GGUF` en el commit `657e078c9408`, por lo que las características de entrenamiento y arquitectura son las del modelo original, no las de una versión reentrenada o ajustada.

## Capacidades

- Generación de texto conversacional en modo chat, orientada a diálogos multi-turno.
- Ejecución completamente offline: tras la descarga, no requiere conexión a internet ni cuenta de usuario.
- Inferencia en dispositivo (on-device) en Android mediante la aplicación LlamaPal, y en cualquier aplicación basada en llama.cpp.
- Compatibilidad con el ecosistema llama.cpp al ser un GGUF estándar.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).
- Cobertura multilingüe: no disponible.

## Casos de uso

- Chat privado en Android sin conexión: el modelo se carga en la aplicación LlamaPal y permite conversaciones locales en las que ningún dato sale del dispositivo, adecuado para usuarios que priorizan privacidad y no quieren depender de la nube.
- Asistente de bolsillo para consultas rápidas: con 229 MB y carga instantánea, sirve para preguntas y respuestas breves en movilidad, incluso sin cobertura de red.
- Prototipado de aplicaciones móviles de IA: los desarrolladores pueden integrar el GGUF en apps basadas en llama.cpp para validar flujos de chat en hardware de gama baja antes de escalar a modelos mayores.
- Demostraciones y pruebas de concepto en entornos sin infraestructura: al caber en un teléfono, permite enseñar funcionalidad de generación de texto sin servidores ni GPU.
- Aplicaciones de campo o entornos aislados: escenarios sin conectividad (zonas rurales, instalaciones con red restringida) donde se necesita generación de texto local y de bajo consumo.
- Filtrado o generación de texto auxiliar en el propio dispositivo: tareas ligeras como resúmenes cortos, reescritura de frases o respuestas predefinidas dentro de una app Android, donde el tamaño reducido del modelo es determinante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 229 MB, por lo que la huella de memoria es del orden de unos pocos cientos de MB incluyendo overhead de contexto y runtime.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU móvil y ejecución en dispositivo.
- ¿Cabe en GPU de consumo? Sí, con amplio margen, en cualquier GPU de consumo actual; también en CPU y en teléfonos Android de gama media.
- Opciones de despliegue: llama.cpp y cualquier aplicación construida sobre él (la app LlamaPal es el caso documentado). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles; el autor describe la respuesta como "a velocidad relámpago" sin aportar cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-350M-Q4_K_M (este) | 354.483.968 | no disponible | GGUF Q4_K_M | LFM Open License v1.0 | Hugging Face (espejo de LlamaPal) |
| LFM2.5-350M (original, Liquid AI) | 354.483.968 | no disponible | safetensors / GGUF | LFM Open License v1.0 | Hugging Face (LiquidAI) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones completas de modelos alternativos comparables, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Con 350 millones de parámetros, la capacidad de razonamiento, conocimiento factual y coherencia en contextos largos es limitada en comparación con modelos de mayor tamaño; es previsible una tasa elevada de alucinaciones en preguntas factuales.
- No se documentan los sesgos del modelo base; al no haber información sobre datos de entrenamiento, no es posible evaluar sesgos de género, idioma o dominio.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del que se haya entrenado el modelo original.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- Licencia LFM Open License v1.0 (etiquetada como `other`): es necesario revisar el texto completo en el archivo `LICENSE` del repositorio antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Este repositorio es un espejo de un tercero (LlamaPal), no el repositorio oficial; para soporte, actualizaciones y model card completa debe consultarse `LiquidAI/LFM2.5-350M-GGUF`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-17) debe tratarse con cautela por posible inconsistencia en los metadatos.

## Enlaces

- Repositorio Hugging Face de este GGUF: https://huggingface.co/LlamaPal/LFM2.5-350M-Q4_K_M-GGUF
- Repositorio oficial del modelo base en GGUF (Liquid AI): https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF
- Repositorio del modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/blob/main/LICENSE
- Aplicación LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
