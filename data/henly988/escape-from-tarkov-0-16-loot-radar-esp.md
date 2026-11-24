# henly988/escape-from-tarkov-0-16-loot-radar-esp

## Resumen

`henly988/escape-from-tarkov-0-16-loot-radar-esp` no es un modelo de inteligencia artificial ni un artefacto de aprendizaje automatico. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una supuesta utilidad de trampas (cheat) para el videojuego Escape From Tarkov, distribuida como binario portable para Windows x64. El repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia; la etiqueta `pipeline` aparece como no disponible y los metadatos describen exclusivamente artefactos de sistema operativo y etiquetas de tipo `windows`, `portable` y `x64`.

El autor, identificado como `henly988`, publica una model card que en realidad funciona como pagina de descarga de un archivo ZIP alojado en un repositorio de GitHub de terceros (`dPellegrini848/escape-from-tarkov-0-16-loot-radar-esp`), con contrasena de extraccion y peticion de ejecucion como administrador. El repositorio registra 0 descargas y 0 likes en Hugging Face, fue creado y actualizado el 24 de noviembre de 2026 y declara licencia MIT.

Desde la perspectiva de un blog tecnico sobre IA open source, este artefacto carece de todo interes como modelo: no hay parametros, contexto, cuantizacion ni capacidades cognitivas que evaluar. Su presencia en el Hub es relevante unicamente como ejemplo de contaminacion del catalogo con contenido ajeno al aprendizaje automatico y potencialmente riesgoso (binarios que solicitan privilegios de administrador y evaden la captura de pantalla). Esta ficha documenta el artefacto tal como aparece, senalando explicitamente la ausencia de informacion tecnica de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario de aplicacion Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La model card describe, en su lugar, un supuesto ejecutable externo en modo usuario para Windows que, segun el autor, emplea tecnicas de lectura de memoria del proceso del juego, un escaner dinamico de offsets, renderizado mediante Desktop Duplication y suavizado de entrada con curvas de Bezier. Estos terminos pertenecen al ambito de la ingenieria de trampas para videojuegos, no al del aprendizaje automatico, y no vienen acompanados de ningun dato verificable sobre tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion como RLHF o DPO.

La unica "innovacion" declarada es la exclusion de la capa de renderizado de las capturas de pantalla de OBS, ShadowPlay y Discord, junto con una tecla de panico (`END`) para descargar el proceso. No se aporta codigo fuente, hash de verificacion ni trazabilidad del binario. Todo ello impide cualquier evaluacion tecnica en terminos de modelo.

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo linguistico.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingues declaradas en los metadatos son meramente etiquetas del repositorio, sin respaldo funcional documentado.
- Segun la model card, el binario afirmaria ofrecer radar 2D, filtrado de loot, suavizado de entrada y descarga por tecla de panico dentro del juego Escape From Tarkov; estas afirmaciones no son verificables y no constituyen capacidades de IA.

## Casos de uso

- No aplica: el artefacto no es un modelo de IA y no puede emplearse en ningun caso de uso legitimo de aprendizaje automatico (generacion, clasificacion, recuperacion, agentes, etc.).
- Auditoria de contenido del Hub: un equipo de gobernanza podria usar este repositorio como ejemplo de fichero ajeno al ambito de Hugging Face que debe revisarse o retirarse.
- Formacion en seguridad: como muestra de patrones de ingenieria social (contrasena en el README, enlace a repositorio de terceros, peticion de ejecucion como administrador) para talleres de concienciacion.
- Analisis de malware: un analista podria estudiar el flujo de distribucion descrito para documentar tecnicas de evasion de captura de pantalla.
- Catalogacion de artefactos no-IA: util para construir taxonomias que separen modelos de otros binarios alojados en el Hub.
- Ningun caso de uso productivo, comercial o de investigacion en IA es aplicable a este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de aprendizaje automatico, y las cifras que aparecen en la model card (por ejemplo, `249 Hz` de sondeo, `368 Hz`, `99.9%` de consistencia o `747K+` descargas) son afirmaciones promocionales del autor sin verificacion independiente y no constituyen benchmarks de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo objetivo declarado: Windows 10 u 11 de 64 bits.
- Opciones de despliegue en inferencia (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de frecuencia de sondeo de la model card no son medibles ni auditables.

## Comparativa con modelos similares

| Artefacto | Naturaleza | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `henly988/escape-from-tarkov-0-16-loot-radar-esp` | Binario de juego (no IA) | no disponible | no disponible | MIT | 0 descargas en Hugging Face |
| Modelo linguistico open source tipico (p. ej. familia Llama, Qwen o Mistral) | Modelo transformer | miles de millones | miles de tokens | licencia propia | pesos en safetensors/GGUF |
| Modelo de vision o multimodal open source | Modelo transformer | variable | variable | variable | pesos publicados |

No existen modelos comparables en la misma categoria, porque este repositorio no pertenece a ninguna categoria de modelo de IA. La comparativa con alternativas reales de IA resulta, por tanto, no disponible.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal en pipelines de inferencia.
- Riesgo de seguridad alto: la model card solicita descargar un ZIP desde un repositorio de GitHub de terceros, extraerlo con contrasena y ejecutar un `.exe` como administrador; este patron es habitual en la distribucion de software malicioso.
- El propio autor reconoce que el binario es detectado por Windows Defender y SmartScreen, lo que constituye una senal de alarma, no una garantia de legitimidad.
- La funcionalidad declarada (trampas en un videojuego multijugador) puede violar los terminos de servicio de Escape From Tarkov y acarrear el baneo de la cuenta del usuario.
- La evasion de captura de pantalla y la lectura de memoria de otro proceso pueden contravenir legislacion sobre acceso no autorizado a sistemas en algunas jurisdicciones.
- No hay sesgos de modelo que analizar, pero si un riesgo claro de alucinacion promocional: las cifras de descargas, valoraciones y rendimiento de la model card no son verificables.
- La licencia MIT declarada no aporta ninguna garantia sobre el contenido del binario distribuido en un repositorio externo.
- No apto para produccion, investigacion ni uso comercial en el ambito de la IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/henly988/escape-from-tarkov-0-16-loot-radar-esp
- Repositorio de GitHub referenciado en la model card (terceros): https://github.com/dPellegrini848/escape-from-tarkov-0-16-loot-radar-esp
- Enlace de descarga directa citado en la model card: https://github.com/dPellegrini848/escape-from-tarkov-0-16-loot-radar-esp/releases/latest/download/escape-from-tarkov-0-16-loot-radar-esp-v1.2.0-win64.zip
- No se han encontrado papers, blogs tecnicos ni demos adicionales en la informacion disponible.
