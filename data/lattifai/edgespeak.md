# LattifAI/EdgeSpeak

## Resumen

EdgeSpeak es un modelo de reconocimiento de voz (speech-to-text) desarrollado por LattifAI, diseñado para ejecutarse íntegramente en el dispositivo (ordenadores de escritorio con macOS o Windows). Su objetivo principal es ofrecer transcripción local de audio y vídeo, eliminando la dependencia de servicios en la nube y garantizando que los datos permanezcan en el equipo del usuario. El modelo se presenta en dos variantes, Flash y Pro, que equilibran velocidad y precisión según la dificultad del audio.

La relevancia de EdgeSpeak radica en la tendencia hacia la IA en el edge: permite transcribir reuniones, entrevistas, vídeos y grabaciones sin conexión, con baja latencia y privacidad total. El repositorio de HuggingFace contiene 29,8 GB de pesos, lo que sugiere un modelo de tamaño considerable, aunque no se han publicado detalles sobre su arquitectura, número de parámetros o longitud de contexto. La licencia Apache 2.0 facilita su uso comercial y su integración en flujos de trabajo propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 29,8 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre la arquitectura interna de EdgeSpeak. Se desconoce si se basa en un transformer, en un modelo de atencion lineal, en una arquitectura hibrida o en cualquier otra familia de modelos. Tampoco hay datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO.

Lo unico confirmado es que el modelo esta disenado para ejecutarse localmente en escritorio, con dos variantes: Flash, orientada a audio y video cotidianos con menor consumo de recursos, y Pro, que apunta a audios mas complejos, acentos dificiles y un mayor techo de precision a costa de un uso mayor de recursos locales. La ausencia de una model card detallada impide cualquier analisis adicional sobre el proceso de entrenamiento.

## Capacidades

- Transcripcion de voz a texto en tiempo real o diferido, completamente local.
- Alineacion de transcripciones con el audio original (timestamping).
- Segmentacion de audio en turnos de habla o fragmentos.
- Herramientas de voz adicionales para flujos de trabajo de agentes de IA.
- Integracion con CLI (interfaz de linea de comandos) y con MCP (Model Context Protocol) para entornos de agentes.
- Dos modos de funcionamiento: Flash (rapido, para audio estandar) y Pro (mayor precision, para audio complejo).
- Compatibilidad con macOS y Windows como plataformas de ejecucion.

## Casos de uso

- Transcripcion de reuniones de trabajo: EdgeSpeak puede ejecutarse en segundo plano durante una videollamada y generar una transcripcion local con marcas de tiempo, sin enviar el audio a servidores externos. Su modo Flash es adecuado para conversaciones con ruido de fondo moderado.
- Entrevistas e investigacion cualitativa: el modo Pro permite transcribir entrevistas con acentos variados o grabaciones de baja calidad, facilitando el analisis posterior sin preocupaciones de privacidad.
- Subtitulado de videos para creadores de contenido: al ejecutarse localmente, el modelo puede procesar videos largos y generar subtitulos sincronizados, integrable en herramientas de edicion mediante CLI.
- Asistente de voz personal en el escritorio: combinado con un agente de IA, EdgeSpeak puede transcribir comandos de voz y alimentar un pipeline de procesamiento local, manteniendo toda la conversacion en el dispositivo.
- Archivado y busqueda de grabaciones: las transcripciones generadas pueden indexarse para busquedas posteriores, util en entornos legales, medicos o de atencion al cliente donde la confidencialidad es critica.
- Automatizacion de flujos de trabajo con MCP: EdgeSpeak puede integrarse en sistemas de agentes que necesitan procesar audio como entrada, por ejemplo, para generar actas de reuniones o resumenes automaticos, todo sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos publicos sobre WER (Word Error Rate), latencia, throughput o comparaciones con otros modelos de reconocimiento de voz. Cualquier afirmacion sobre rendimiento relativo carece de respaldo documental.

## Requisitos de hardware

- No se han publicado requisitos minimos de VRAM ni de GPU especificas.
- El tamano del repositorio (29,8 GB) sugiere que los pesos completos requieren una GPU con al menos 24 GB de VRAM si se cargan en precision FP16, o menos si se aplica cuantizacion, pero no hay confirmacion oficial.
- Dado su enfoque en escritorio, es probable que funcione en GPUs de consumo como RTX 3090, RTX 4090 o equivalentes, pero no se ha verificado.
- No se dispone de informacion sobre latencia o throughput estimados.
- Opciones de despliegue: se menciona CLI y MCP, lo que sugiere compatibilidad con herramientas como llama.cpp o vLLM, aunque no esta confirmado.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Como referencia cualitativa, EdgeSpeak compite con soluciones como Whisper de OpenAI (en sus variantes large y turbo) o con modelos locales como Parakeet de NVIDIA. Sin embargo, al carecer de benchmarks y especificaciones tecnicas, no es posible establecer una comparacion rigurosa. Se recomienda esperar a que LattifAI publique documentacion tecnica detallada.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o errores tipicos en la transcripcion.
- La ausencia de una model card completa impide evaluar la robustez del modelo ante ruido, acentos o idiomas distintos.
- Aunque la licencia Apache 2.0 permite uso comercial, no se especifican restricciones adicionales sobre el uso de los datos de entrenamiento.
- El modelo esta orientado a escritorio; no se ha confirmado su funcionamiento en servidores o entornos embebidos.
- La falta de documentacion sobre cuantizacion y formatos de pesos puede dificultar su integracion en pipelines existentes.

## Enlaces

- HuggingFace: https://huggingface.co/LattifAI/EdgeSpeak
- Sitio web oficial: https://edgespeak.com/
- Sitio web en espanol: https://edgespeak.com/es
- Repositorio GitHub: https://github.com/lattifai/EdgeSpeak
