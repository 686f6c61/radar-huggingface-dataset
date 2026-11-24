# itoodens/runescape-dragonwilds-bot-trainer

## Resumen

El artefacto publicado bajo el identificador `itoodens/runescape-dragonwilds-bot-trainer` en Hugging Face no es un modelo de inteligencia artificial ni un conjunto de pesos entrenados. Se trata de un repositorio que distribuye un ejecutable para Windows de 64 bits (`solara-executor-v3-keyless-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) presentado como "bot trainer" para el videojuego RuneScape: Dragonwilds. La model card describe módulos de overlay externo, radar 2D, filtro de loot y una capa de renderizado "stream-proof" orientada a evadir capturas de OBS, ShadowPlay y Discord.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni datos de entrenamiento. Los tags de Hugging Face (`windows`, `x64`, `portable`) corresponden a un artefacto binario, no a un modelo. Por tanto, esta ficha documenta el artefacto tal como aparece publicado y advierte de que no debe evaluarse como modelo de IA.

La relevancia de esta ficha es principalmente defensiva: el paquete se distribuye con contraseña de archivo (`2026`), enlaces de descarga alojados en repositorios de GitHub de terceros y solicitud de ejecución "como administrador", un patrón habitual en campañas de malware disfrazado de cheat o trainer. Cualquier evaluación técnica debe partir de esa premisa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe` para win64) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. El artefacto es un ejecutable nativo de Windows x64 empaquetado en un ZIP de 4,8 MB con contraseña `2026`. La model card menciona componentes internos como un "user-mode external core" que renderiza mediante Desktop Duplication sin inyectar DLLs, un overlay externo a 144 Hz o más con cajas 2D/3D y esqueletos, un radar 2D con filtrado de loot, y una "panic key" (`END`) para descargar el proceso en menos de 6 ms. También cita cifras de latencia (menos de 24 ms para el radar, menos de 27 ms para el core) y un sondeo a 467 Hz, pero no se aporta ninguna evidencia verificable de estas mediciones.

No se documenta ningún proceso de entrenamiento, dataset, RLHF, DPO ni innovación algorítmica. El binario declara build `v4.0.1` con identificador `F0E11EE449`.

## Capacidades

- Distribución de un ejecutable para Windows 10/11 de 64 bits con instrucciones de extracción mediante 7-Zip o WinRAR y contraseña `2026`.
- Overlay externo declarado con cajas 2D/3D, esqueletos y ESP de distancia, según la model card.
- Radar 2D con filtrado de objetos por rareza y seguimiento de contenedores, según la model card.
- Perfiles JSON con cambio en caliente entre presets "Legit", "Visual" y "Custom".
- Capa de renderizado declarada como excluida de capturas de OBS, ShadowPlay y Discord.
- Atajo de pánico (`END`) para terminar el proceso.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión por IA, tool calling, agentes ni capacidades multilingües reales; los idiomas listados son metadatos del repositorio.

## Casos de uso

- Auditoría de seguridad: analizar el binario en una máquina virtual aislada y sin red para determinar su comportamiento real antes de cualquier uso.
- Investigación de campañas de malware: estudiar el patrón de distribución (ZIP con contraseña, enlaces a repositorios de GitHub de terceros, ejecución como administrador) como ejemplo de ingeniería social.
- Formación en concienciación: usar la model card como caso práctico de señales de alarma en repositorios de Hugging Face que no contienen modelos.
- Documentación de threat intelligence: registrar hashes, URLs de descarga y metadatos del artefacto en una base de indicadores de compromiso.
- Pruebas de detección: comprobar si el antivirus y el EDR de la organización marcan el ZIP o el EXE, y ajustar reglas si es necesario.
- Revisión de políticas de ingesta: validar que los pipelines internos que consumen Hugging Face rechazan repositorios sin `pipeline_tag` ni pesos en formato `safetensors` o `GGUF`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras que aparecen en la model card (467 Hz de sondeo, menos de 6 ms de respuesta de la panic key, menos de 24 ms del radar, menos de 27 ms del core, 8 y 9 hilos de trabajo) son afirmaciones del autor sin metodología ni evidencia reproducible, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según la model card.
- Espacio en disco: aproximadamente 4,8 MB para el ZIP; el tamaño descomprimido no se especifica.
- VRAM: no aplica; no es un modelo de IA y no requiere GPU para inferencia.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son compatibles con este artefacto).
- Latencia y throughput: no verificables; las cifras declaradas por el autor carecen de metodología.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `itoodens/runescape-dragonwilds-bot-trainer` | Binario Windows x64 (ZIP + EXE) | no aplica | no aplica | MIT | Hugging Face, 0 descargas, 0 likes |
| Modelo de lenguaje open source típico (p. ej. familia Llama, Qwen o Mistral) | Pesos de red neuronal | Miles de millones | Miles de tokens | Licencias específicas por modelo | Hugging Face con `pipeline_tag` y `safetensors` |
| Repositorio de dataset en Hugging Face | Datos (Parquet, JSONL) | no aplica | no aplica | Variable | Hugging Face con visor de datasets |
| Repositorio de código en GitHub | Código fuente | no aplica | no aplica | Variable | GitHub con historial de commits |

No existe un modelo comparable en la categoría de IA porque este artefacto no es un modelo. La comparación relevante es con otros repositorios de Hugging Face que tampoco contienen pesos, y que en la práctica suelen ser artefactos binarios o campañas de distribución.

## Limitaciones y advertencias

- No es un modelo de IA: carece de arquitectura, pesos, tokenizador, contexto y pipeline. No puede usarse para generación de texto, código ni ninguna tarea de machine learning.
- El artefacto se distribuye como ejecutable de Windows con contraseña de archivo (`2026`) y solicitud de ejecución como administrador, un patrón asociado con frecuencia a malware y a software no verificado.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`GraceFernandez01321/solara-executor-v3-keyless`, `vilhelm754/runescape-dragonwilds-bot-trainer`) distintos del propietario del repositorio en Hugging Face, lo que impide verificar la cadena de custodia del binario.
- La model card incluye afirmaciones de rendimiento (frecuencias, latencias, número de hilos) sin metodología, código fuente ni evidencia reproducible.
- El uso de herramientas de este tipo en videojuegos puede infringir los términos de servicio de RuneScape: Dragonwilds y acarrear el bloqueo de cuentas.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del binario; la licencia se aplica al contenido del repositorio, no a la ausencia de código malicioso.
- No se han publicado resultados de benchmarks, evaluaciones de sesgo ni análisis de seguridad independientes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, pese a que la model card afirma "658K+ downloads" y una valoración de "4.8/5", lo que supone una contradicción verificable.
- Para producción: no debe integrarse en ningún pipeline; si se manipula, hacerlo únicamente en un entorno aislado y con análisis previo de malware.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/itoodens/runescape-dragonwilds-bot-trainer
- Repositorio de GitHub citado en la model card: https://github.com/vilhelm754/runescape-dragonwilds-bot-trainer
- Releases del repositorio de GitHub citado: https://github.com/vilhelm754/runescape-dragonwilds-bot-trainer/releases/latest
- Repositorio de GitHub del binario referenciado: https://github.com/GraceFernandez01321/solara-executor-v3-keyless
- Enlace de descarga directa citado en la model card: https://github.com/GraceFernandez01321/solara-executor-v3-keyless/releases/download/v1.2.0/solara-executor-v3-keyless-v1.2.2-win64.zip
