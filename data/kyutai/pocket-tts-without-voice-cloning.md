# kyutai/pocket-tts-without-voice-cloning

## Resumen

Pocket TTS es un modelo de síntesis de voz (text-to-speech) desarrollado por Kyutai, un laboratorio de investigación en IA de código abierto con sede en Francia y financiado por Iliad Group, CMA CGM Group y Schmidt Sciences. El modelo está diseñado especificamente para ejecutarse de forma eficiente en CPU, sin necesidad de GPU ni de APIs externas, lo que lo convierte en una opción poco habitual dentro del ecosistema TTS, dominado por modelos de mayor tamaño que requieren aceleración por hardware.

Con aproximadamente 100 millones de parámetros, Pocket TTS prioriza la eficiencia y la latencia baja sobre la calidad absoluta. Genera audio en streaming con una latencia de unos 200 ms hasta el primer fragmento y funciona a aproximadamente 6 veces la velocidad de tiempo real en una CPU de MacBook Air M4, usando solo 2 núcleos. Soporta seis idiomas (inglés, francés, alemán, portugués, italiano y español) y puede procesar entradas de texto de longitud ilimitada.

La relevancia actual del modelo radica en su enfoque de despliegue en el borde (edge) y en el navegador: permite generar voz en local, sin dependencias de servicios en la nube, con una licencia permisiva (CC-BY-4.0) y código de entrenamiento publicado desde agosto de 2026. La variante publicada en este repositorio, `pocket-tts-without-voice-cloning`, está restringida deliberadamente para no permitir la clonación de voz, lo que reduce el riesgo de suplantación de identidad y usos fraudulentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en la investigación de Kyutai sobre delayed streams modeling) |
| Parámetros totales | ~100M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; admite entradas de texto de longitud ilimitada mediante streaming |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), francés (fr), alemán (de), portugués (pt), italiano (it), español (es) |
| Licencia | CC-BY-4.0 (con cláusula de uso prohibido en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se enmarca en la línea de investigación de Kyutai sobre delayed streams modeling, técnica empleada también en su modelo TTS de 1.6B publicado en julio de 2025. Pocket TTS es una variante compacta de aproximadamente 100M de parámetros orientada a inferencia en CPU. Los idiomas distintos del inglés disponen de variantes de 24 capas de mayor calidad pero más lentas (por ejemplo, `italian_24l`).

En cuanto a entrenamiento, la model card no especifica el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se indica que el código de entrenamiento está disponible en el repositorio de GitHub desde agosto de 2026, lo que permite entrenar modelos propios y contribuir variantes a la sección de modelos entrenados por la comunidad. Las voces preentrenadas provienen de catálogos como VCTK, Expresso y Common Voice, con licencias detalladas por voz en el repositorio `kyutai/tts-voices`.

## Capacidades

- Generación de voz a partir de texto con streaming de audio y latencia baja (~200 ms hasta el primer fragmento).
- Síntesis multilingüe en seis idiomas: inglés, francés, alemán, portugués, italiano y español.
- Procesamiento de entradas de texto de longitud ilimitada mediante generación por streaming.
- Catálogo de voces preentrenadas con licencias individuales documentadas.
- API de Python y interfaz de línea de comandos (CLI) con comandos `generate`, `export-voice` y `serve`.
- Exportación de voces y configuración personalizada mediante YAML local, URL HTTPS o rutas `hf://`.
- Ejecución en navegador del lado del cliente (implementaciones in-browser).
- Esta variante concreta no incluye clonación de voz; la clonación está disponible en la variante principal `kyutai/pocket-tts`.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- **Lectura de artículos y documentos en local**: integrado como biblioteca Python, el modelo convierte texto largo en audio de forma continua gracias al soporte de entradas ilimitadas, sin depender de servicios en la nube y con una licencia que facilita su redistribución.
- **Asistentes de voz para aplicaciones de escritorio**: al ejecutarse en CPU con solo 2 núcleos y a ~6x tiempo real, puede incorporarse en aplicaciones de escritorio o herramientas de productividad sin exigir GPU dedicada.
- **Accesibilidad en entornos con hardware limitado**: la baja huella de recursos permite generar voz en equipos sin aceleración por hardware, útil para lectores de pantalla o interfaces accesibles en dispositivos modestos.
- **Síntesis de voz en el navegador**: las implementaciones in-browser permiten generar audio del lado del cliente, reduciendo costes de servidor y latencia de red en aplicaciones web interactivas.
- **Generación de avisos y locuciones automatizadas**: para sistemas de anuncios, notificaciones o contenidos educativos multilingües donde se requiere volumen alto y coste bajo por petición.
- **Prototipado rápido de productos de voz**: con instalación vía `pip install pocket-tts` y CLI inmediata, permite validar ideas de producto TTS en minutos, sin infraestructura GPU.
- **Investigación y experimentación en TTS**: el código de entrenamiento publicado y la posibilidad de entrenar variantes propias lo convierten en una base para estudiar síntesis de voz eficiente en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento indicados en la model card son operativos: ~200 ms hasta el primer fragmento de audio, ~6x tiempo real en una CPU de MacBook Air M4 y uso de solo 2 núcleos de CPU.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse sin GPU; no requiere la versión CUDA de PyTorch.
- VRAM estimada: no aplica en el caso de uso principal en CPU; no se dispone de estimaciones de VRAM para despliegue en GPU.
- GPU recomendadas: no disponibles; el diseño del modelo no las requiere.
- Compatibilidad con GPU de consumo: no documentada, al no ser el objetivo del modelo.
- Despliegue: paquete `pip install pocket-tts`, CLI `pocket-tts` con comandos `generate`, `export-voice` y `serve`, y ejecución mediante `uvx` en entorno aislado.
- Requisitos de software: Python 3.10 a 3.14 y PyTorch 2.5 o superior.
- Latencia y throughput: ~200 ms hasta el primer fragmento; ~6x tiempo real en CPU de MacBook Air M4 con 2 núcleos.
- Despliegue en navegador: existen implementaciones in-browser documentadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Ejecución | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Pocket TTS (esta variante) | ~100M | CPU, navegador | 6 | CC-BY-4.0 | Sin clonación de voz; streaming y latencia ~200 ms |
| Kyutai TTS 1.6B | 1.6B | no disponible | no disponible | no disponible | Publicado en julio de 2025; delayed streams modeling; mayor tamaño |
| Alternativas TTS de gran tamaño | no disponible | GPU | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente sobre otros modelos TTS comparables para establecer una comparativa de rendimiento con datos verificables.

## Limitaciones y advertencias

- Esta variante no permite clonación de voz; la clonación está disponible únicamente en la variante principal `kyutai/pocket-tts`.
- La model card establece una lista explícita de usos prohibidos: suplantación o clonación de voz sin consentimiento explícito y lícito, desinformación, llamadas fraudulentas, presentación de contenido generado como grabaciones reales y generación de contenido ilícito, difamatorio, acosador, discriminatorio o que vulnere la privacidad.
- El acceso al modelo está condicionado a la aceptación de un formulario (gated) con campos sobre empresa o universidad y finalidad de uso.
- La licencia CC-BY-4.0 exige atribución; es apta para uso comercial con cumplimiento de las condiciones de la model card.
- El tamaño reducido (~100M parámetros) implica compromisos en calidad de voz frente a modelos TTS de mayor tamaño; las variantes de 24 capas para idiomas no ingleses mejoran la calidad a costa de velocidad.
- No se documentan sesgos específicos del modelo ni tasas de error en la información disponible.
- No se dispone de datos sobre robustez ante texto adversario, números, siglas o entidades poco frecuentes.
- Las voces preentrenadas tienen licencias individuales que deben verificarse antes de su uso en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kyutai/pocket-tts-without-voice-cloning)
- [Variante principal con clonación de voz](https://huggingface.co/kyutai/pocket-tts)
- [Demo interactiva](https://kyutai.org/pocket-tts)
- [Repositorio GitHub](https://github.com/kyutai-labs/pocket-tts)
- [Documentación](https://kyutai-labs.github.io/pocket-tts/)
- [Tech report](https://kyutai.org/blog/2026-01-13-pocket-tts)
- [Paper (arXiv:2509.06926)](https://arxiv.org/abs/2509.06926)
- [Catálogo de voces y licencias](https://huggingface.co/kyutai/tts-voices)
- [Kyutai TTS 1.6B](https://kyutai.org/next/tts/)
- [Sitio web de Kyutai](https://kyutai.org/)
- [Organización Kyutai en GitHub](https://github.com/kyutai-labs)
- [Organización Kyutai en Hugging Face](https://huggingface.co/kyutai)
