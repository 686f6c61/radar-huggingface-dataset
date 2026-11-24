# Esstor/arc-raiders-cheat-esp-pc

## Resumen

El repositorio `Esstor/arc-raiders-cheat-esp-pc` no contiene un modelo de inteligencia artificial, sino un paquete distribuible para Windows x64 etiquetado como herramienta de trampas (cheat) con funcionalidad de ESP (extra-sensorial perception) para el videojuego Arc Raiders. La model card se presenta como una guía de instalación de un ejecutable comprimido en un archivo ZIP de 4,8 MB protegido con contraseña, con instrucciones para ejecutarlo como administrador. No existe ningún artefacto de pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociado.

El contenido de la model card mezcla referencias a un supuesto "cheat ESP" con nombres de ficheros propios de un bot de trading de criptomonedas (`pump-fun-jito-bundler-sniper-bot-2026`), lo que apunta a una plantilla reutilizada o a un señuelo. Los enlaces de descarga apuntan a un repositorio de GitHub de terceros (`carlos7088/pump-fun-jito-bundler-sniper-bot-2026`), no al repositorio de Hugging Face, y el binario se distribuye con contraseña de descompresión, práctica habitual en campañas de distribución de software potencialmente malicioso.

Desde la perspectiva de evaluación de modelos, esta ficha no tiene utilidad técnica: no hay parámetros, contexto, licencia de pesos ni benchmarks. Se documenta aquí únicamente para dejar constancia de que el identificador existe en Hugging Face y de que su contenido no es un modelo de IA. Cualquier uso del binario conlleva riesgos de seguridad y de cumplimiento de los términos de servicio del videojuego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; paquete ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no del modelo) |
| Licencia | MIT (según metadatos del repo) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No aplica. No se describe ninguna arquitectura de red neuronal, corpus de entrenamiento, proceso de alineación (RLHF/DPO) ni innovación técnica de inferencia. La model card describe módulos de un supuesto software de trampas: núcleo externo en modo usuario, overlay externo a 144 Hz, escáner dinámico de offsets, suavizado de entrada Bézier, capa de render excluida de capturas (OBS, ShadowPlay, Discord) y radar 2D con filtro de loot. Estos elementos son funcionalidades de un cheat de videojuego, no componentes de un modelo lingüístico o multimodal.

El paquete se distribuye como `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip` (4,8 MB) con contraseña `2026` y un ejecutable `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe` identificado como build `v3.1.6` (`03E2F86856`). La discrepancia entre el nombre del cheat y el del binario (bot de trading) es una señal de alarma sobre la procedencia y el propósito real del contenido.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües reales; los idiomas listados son etiquetas de metadatos del repositorio.
- El contenido declarado corresponde a funcionalidades de trampa en un videojuego (ESP, radar, suavizado de puntería), sin relación con IA.

## Casos de uso

- No se identifica ningún caso de uso legítimo como modelo de IA: no hay artefacto de inferencia que desplegar.
- Evaluación de modelos: no aplica, al no existir pesos ni arquitectura que medir.
- Integración en pipelines de NLP: no aplica.
- Generación de código en producción: no aplica.
- Atención al cliente automatizada: no aplica.
- Análisis documental o RAG: no aplica.
- Uso del binario distribuido: desaconsejado por riesgo de seguridad (ejecutable con contraseña, alojado en un repositorio de terceros, sin verificación de integridad publicada) y por incumplimiento previsible de los términos de servicio de Arc Raiders.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de marketing no verificables (por ejemplo, tiempos de respuesta de 37 ms, 35 ms y 41 ms, o 295 Hz de sondeo), pero no son métricas de un modelo de IA ni están respaldadas por una metodología reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponible; las cifras de la model card no son verificables.
- Requisito declarado del paquete: Windows de 64 bits (Windows 11 mencionado en las etiquetas), extracción del ZIP con contraseña y ejecución como administrador.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que el repositorio no contiene un modelo de IA. Frente a modelos open source reales (por ejemplo, familias tipo Llama, Qwen o Mistral), la comparación es imposible: faltan parámetros, contexto, licencia de pesos y benchmarks.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, tokenizador, configuración y pipeline; no puede evaluarse ni desplegarse como tal.
- Riesgo de seguridad: distribución de un ejecutable de Windows con contraseña de descompresión, alojado en un repositorio de GitHub de terceros y no en el repositorio de Hugging Face, sin hashes de verificación publicados.
- Señales de campaña engañosa: nombre del cheat distinto del nombre del binario (bot de trading), insignias de descargas y valoraciones no verificables, y advertencias sobre Windows Defender/SmartScreen en la propia FAQ.
- Riesgo legal y de cumplimiento: el uso de cheats en videojuegos suele violar los términos de servicio y puede acarrear suspensiones de cuenta; en algunas jurisdicciones puede tener implicaciones adicionales.
- Idiomas: las etiquetas de idioma del repositorio no implican capacidades lingüísticas reales.
- Licencia: la etiqueta MIT del repositorio no garantiza la legalidad ni la seguridad del binario distribuido; la licencia de un metadato no cubre el software de terceros enlazado.
- Sesgos y alucinación: no aplica como modelo de lenguaje; la model card contiene afirmaciones no contrastables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Esstor/arc-raiders-cheat-esp-pc
- Repositorio de GitHub citado en la model card: https://github.com/JakubHedlund06/arc-raiders-cheat-esp-pc
- Releases del repositorio citado: https://github.com/JakubHedlund06/arc-raiders-cheat-esp-pc/releases/latest
- Enlace de descarga del ZIP (terceros, no verificado): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
