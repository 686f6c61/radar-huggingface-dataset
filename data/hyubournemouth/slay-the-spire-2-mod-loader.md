# hyubournemouth/slay-the-spire-2-mod-loader

## Resumen

El artefacto publicado bajo el identificador `hyubournemouth/slay-the-spire-2-mod-loader` no es un modelo de inteligencia artificial, sino un paquete de software para Windows x64 presentado como cargador de mods, desbloqueador de reliquias y analizador de semillas de barajas para el videojuego *Slay the Spire 2*. El repositorio de Hugging Face contiene exclusivamente metadatos de distribución (etiquetas de sistema operativo, idiomas y licencia MIT) y una model card que describe un ejecutable portable con soporte para DirectX 12 y Vulkan.

La relevancia de esta ficha es fundamentalmente negativa desde la perspectiva de evaluación de modelos: no existe arquitectura neuronal, ni parámetros, ni tokenizador, ni pesos en formato safetensors o GGUF. El contenido del repositorio son instrucciones de descarga de un archivo `.zip` alojado en un repositorio de GitHub de terceros, con una contraseña de extracción, y una serie de afirmaciones de rendimiento (latencia p99, huella de memoria, verificación SHA-256) que no son verificables con la información disponible y que no corresponden a métricas de inferencia de un modelo lingüístico.

Por tanto, esta ficha documenta el artefacto tal como está publicado, señalando explícitamente qué campos de la estructura técnica no son aplicables o no están disponibles, y advirtiendo de los riesgos de seguridad asociados a la descarga y ejecución de binarios distribuidos mediante enlaces externos con contraseña. No se debe tratar este repositorio como un modelo de lenguaje en ningún pipeline de evaluación, despliegue o comparación de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; se describe como ejecutable nativo x64 para Windows) |
| Parametros totales | no disponible (no aplicable) |
| Parametros activos | no disponible (no aplicable) |
| Longitud de contexto | no disponible (no aplicable) |
| Tipos de cuantizacion | no disponible (no aplicable) |
| Idiomas soportados | en, es, pt, de, fr, tr, pl, ja, ko, id, vi, zh (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un archivo `.zip` para Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red neuronal, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF, DPO) en la información disponible. La model card describe un binario de 64 bits para Windows 10 (22H2+) y Windows 11 (23H2/24H2) con alineación de registros vectoriales AVX2, configuración JSON recargable en caliente (`config/settings.json`) y soporte de las API gráficas DirectX 12 y Vulkan 1.3. Estas descripciones corresponden a un programa de modding de un videojuego, no a un modelo de aprendizaje automático.

Las cifras de rendimiento incluidas en la model card (latencia p99 de 1,42 ms a 2,15 ms, huella de memoria de 42,4 MB a 45,2 MB de RAM, incremento de FPS en percentil 1 del 37 % al 48 %) se presentan como mediciones en bancos de pruebas con CPU y GPU concretas, pero no se aporta metodología reproducible, código de medición ni artefactos de verificación más allá de una referencia a SHA-256. No se ha podido confirmar ninguno de estos valores con la información proporcionada.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión, al no tratarse de un modelo de IA.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- El artefacto se presenta como cargador de mods para *Slay the Spire 2*, con funciones declaradas de desbloqueo de reliquias y análisis de semillas de barajas.
- Se declaran 12 idiomas en las etiquetas del repositorio, presumiblemente para la documentación o la interfaz del programa, sin que se detalle el alcance de la localización.
- No se documenta ningún modo de pensamiento (*thinking mode*), audio ni capacidades multimodales.

## Casos de uso

- No aplicable a evaluación de modelos de lenguaje: el artefacto no procesa texto ni genera respuestas, por lo que no encaja en casos de atención al cliente, generación de código, resumen documental ni recuperación aumentada.
- Documentación de referencia sobre distribución de artefactos en Hugging Face: puede utilizarse como ejemplo de repositorio que incumple las convenciones de model cards para IA y que mezcla metadatos de modelo con instrucciones de descarga de binarios.
- Análisis de seguridad de cadena de suministro: útil para formar a equipos sobre los riesgos de ejecutar binarios descargados desde enlaces externos con contraseña de extracción y sin verificación de firma del editor.
- Auditoría de licencias: sirve como caso práctico de un repositorio etiquetado como MIT cuyos artefactos distribuidos no están cubiertos explícitamente por el texto de la licencia en la información disponible.
- Estudio de SEO abusivo en plataformas de modelos: la model card incluye enlaces a portales `github.io`, repositorios espejo y paquetes Go, un patrón habitual en campañas de posicionamiento y distribución de software no verificado.
- Formación en higiene de dependencias: ejemplo de por qué conviene fijar versiones, verificar hashes publicados de forma independiente y evitar ejecutables portables sin trazabilidad de build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos de lenguaje en la información disponible. La model card incluye una tabla de rendimiento del ejecutable que no corresponde a métricas de inferencia de IA; se reproduce a continuación únicamente como dato documental, sin que haya podido verificarse:

| Perfil de hardware | API / runtime | Latencia p99 declarada | Memoria declarada | Verificación declarada |
|---|---|---|---|---|
| RTX 4070 / Ryzen 7 7800X3D (Win 11 24H2 x64) | DX12 / Vulkan 1.3 | 1,42 ms (+48 % FPS en percentil 1) | 44,8 MB RAM | PASS (SHA-256) |
| RTX 3060 / Core i5-13600K (Win 11 23H2 x64) | DX12 / AVX2 | 1,89 ms (+41 % FPS en percentil 1) | 42,4 MB RAM | PASS (SHA-256) |
| RX 7800 XT / Ryzen 5 7600X (Win 10 22H2 x64) | Vulkan / Async Compute | 1,65 ms (+44 % FPS en percentil 1) | 43,1 MB RAM | PASS (SHA-256) |
| Arc A770 / Core i7-12700K (Win 11 24H2 x64) | XeSS / DX12 SwapChain | 2,15 ms (+37 % FPS en percentil 1) | 45,2 MB RAM | PASS (SHA-256) |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; no hay pesos de modelo que cargar.
- GPU recomendadas: la model card menciona pruebas con RTX 4070, RTX 3060, RX 7800 XT y Arc A770, pero como entornos de ejecución de un juego, no como aceleradores de inferencia.
- Compatibilidad con GPU de consumo: el artefacto declara funcionar en Windows 10/11 x64 con DirectX 12 o Vulkan 1.3, sin requisitos de VRAM especificados.
- Opciones de despliegue: no aplicable (no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: solo las cifras declaradas por el autor en la tabla anterior, no verificadas de forma independiente.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo de lenguaje. Como referencia de categoría, los cargadores de mods para videojuegos se distribuyen habitualmente mediante gestores como Vortex o Mod Organizer 2, con firmas de editor y repositorios versionados; la información proporcionada no permite establecer una comparación técnica rigurosa con esas herramientas.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, tokenizador, arquitectura y capacidad de inferencia; no debe incluirse en evaluaciones de MMLU, HumanEval, GSM8K ni similares.
- El binario se distribuye mediante un enlace a un repositorio de GitHub de terceros con un nombre de archivo que no coincide con el del proyecto (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip`), lo que supone un riesgo de cadena de suministro.
- La extracción requiere una contraseña (`2026`), un patrón que dificulta el análisis automático de malware y la verificación del contenido por parte de escáneres de seguridad.
- No se aporta firma de código, hash publicado de forma independiente ni procedencia de build verificable; la referencia a SHA-256 en la model card no incluye el valor del hash.
- La licencia MIT se declara a nivel de repositorio, pero no se especifica qué componentes del `.zip` quedan cubiertos ni si se incluyen dependencias de terceros con otras licencias.
- La model card contiene afirmaciones de rendimiento y de verificación que no son reproducibles con la información disponible; deben tratarse como no verificadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento que permita evaluar su fiabilidad.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas en el sentido habitual de un modelo de lenguaje, porque no aplica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hyubournemouth/slay-the-spire-2-mod-loader
- Repositorio GitHub declarado (principal): https://github.com/R3lexa/slay-the-spire-2-mod-loader
- Repositorio GitHub declarado (espejo): https://github.com/mywilliam211/slay-the-spire-2-mod-loader
- Portal `github.io` declarado: https://r3lexa.github.io/slay-the-spire-2-mod-loader/
- Portal `github.io` espejo declarado: https://mywilliam211.github.io/slay-the-spire-2-mod-loader/
- Documentación en pkg.go.dev declarada: https://pkg.go.dev/github.com/R3lexa/slay-the-spire-2-mod-loader
- Notebook en nbviewer declarado: https://nbviewer.org/github/R3lexa/slay-the-spire-2-mod-loader/blob/main/notebooks/quickstart.ipynb
- Enlace de descarga del `.zip` declarado: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip (no verificado; se recomienda no ejecutar)
