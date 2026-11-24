# Novedsikhi/gmgn-bullx-photon-copytrade-bot-keyless

## Resumen

El artefacto publicado bajo el identificador `Novedsikhi/gmgn-bullx-photon-copytrade-bot-keyless` no es un modelo de inteligencia artificial ni contiene pesos de red neuronal. Se trata de un repositorio de Hugging Face que redistribuye un supuesto ejecutable para Windows (`blox-fruits-script-keyless-2026-v1.2.2-win64.exe`), empaquetado en un archivo ZIP de 4,8 MB protegido con la contraseña `2026`, y presentado mediante una model card con formato de landing page promocional. La nomenclatura mezcla términos de trading de criptomonedas (GMGN, BullX, Photon, copytrade) con referencias a un script de videojuego (Blox Fruits), lo que apunta a una plantilla reutilizada de campañas de distribución de software.

No existe información técnica verificable sobre arquitectura, parámetros, contexto ni datos de entrenamiento, porque el artefacto no es un modelo. El repositorio declara licencia MIT y una lista de catorce idiomas, etiquetas de plataforma (`windows`, `windows-11`, `x64`, `portable`) y cero descargas y cero likes en el momento de la consulta. La fecha de creación declarada (2026-11-24) es posterior a la fecha actual, otro indicio de que los metadatos no son fiables.

La relevancia de esta ficha es, por tanto, fundamentalmente defensiva: documentar el artefacto para que desarrolladores e investigadores lo identifiquen como lo que es y no lo confundan con un modelo open source evaluable. Los indicadores de riesgo son múltiples y coincidentes: binario ejecutable de procedencia desconocida, contraseña de descompresión que evade el análisis estático de antivirus, instrucciones de ejecución como administrador, enlaces de descarga alojados en repositorios de GitHub de terceros no relacionados con el autor declarado, e insignias de descargas y valoraciones inventadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni ningún formato de pesos) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni pesos, ni código de inferencia, ni tokenizador, ni configuración de transformer, MoE o SSM. La model card describe funcionalidades de un supuesto bot de copytrading en Solana (filtro antihoneypot previo a la compra, motor de bundles Jito/MEV, bóveda local AES-256, bundler de 20 carteras con Lookup Tables, sandbox de paper trading y enrutado de órdenes por debajo de 40 ms), pero no aporta ningún detalle verificable sobre implementación, dependencias o metodología. Las cifras de consistencia que menciona (97,9 % y 98,4 %) no van acompañadas de definición de métrica, conjunto de prueba ni protocolo de medición.

El contenido textual de la model card presenta inconsistencias internas notables: el título y las etiquetas hablan de un bot de copytrading, mientras que el nombre del archivo descargable y del ejecutable corresponde a un script del videojuego Blox Fruits; el tamaño declarado (4,8 MB) es incompatible con las capacidades descritas; y los enlaces de descarga apuntan a repositorios de GitHub (`JisungDiaz447/...`, `tomasz5646/...`) distintos del espacio de nombres del autor en Hugging Face. Todo ello es consistente con una plantilla de distribución de software empaquetado y no con un proyecto de IA.

## Capacidades

- No hay capacidades de modelo que evaluar: no genera texto, no razona, no escribe código ni procesa imágenes.
- No soporta tool calling ni function calling en el sentido de un LLM; las "funciones" que menciona la model card son hipotéticas operaciones de un bot de trading.
- No dispone de modo de razonamiento, visión, audio ni capacidad multilingüe real; la lista de idiomas es metadato de repositorio.
- El artefacto declarado es un ejecutable nativo de Windows 10/11 x64 que, según el autor, requiere extracción con contraseña y ejecución como administrador.

## Casos de uso

- No se identifican casos de uso legítimos para un modelo de IA, porque no es un modelo.
- Auditoría de seguridad: analizar el binario en un entorno aislado (máquina virtual sin red, sandbox de malware) para determinar su comportamiento real antes de cualquier otra consideración.
- Investigación de campañas de distribución: estudiar el patrón de model card falsa, contraseña de archivo y enlaces a repositorios de terceros como ejemplo de abuso de plataformas de modelos.
- Formación y concienciación: usar el caso como ejemplo documentado de por qué no deben ejecutarse binarios descargados de repositorios de modelos sin verificación de procedencia.
- Catalogación y filtrado: incorporar el identificador a listas de bloqueo o a filtros de curación de datasets y repositorios.
- No se recomienda su uso para trading, automatización financiera, ni para ninguna operación con claves privadas o fondos, dado que no existe verificación independiente del binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (descargas, valoración 4,9/5, consistencias del 97,9 % y 98,4 %, latencia inferior a 40 ms) no son benchmarks de modelo ni están respaldadas por metodología alguna; se listan aquí únicamente como afirmaciones del autor no verificadas.

| Afirmación del autor | Valor declarado | Verificación |
|---|---|---|
| Descargas | 38K+ | No verificable; el repositorio muestra 0 descargas |
| Valoración | 4,9/5 | No verificable; el repositorio muestra 0 likes |
| Consistencia del bundler | 97,9 % | No verificable; sin métrica definida |
| Consistencia del sandbox | 98,4 % | No verificable; sin métrica definida |
| Latencia de enrutado | < 40 ms | No verificable; sin condiciones de red ni hardware |
| Uso de RAM | < 59 MB | No verificable |

## Requisitos de hardware

- VRAM: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: ninguna; el artefacto declarado es un ejecutable de CPU para Windows x64.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (no hay soporte de vLLM, llama.cpp, Ollama ni TGI).
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits, procesadores Intel y AMD x64.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de lenguaje o multimodales. Frente a un modelo open source real, las diferencias son categóricas: un modelo publica pesos en safetensors o GGUF, documenta arquitectura, tokens de entrenamiento y evaluación, y se ejecuta mediante runtimes de inferencia; este repositorio publica un ZIP con un ejecutable y una landing page.

| Criterio | Este artefacto | Modelo open source típico |
|---|---|---|
| Pesos publicados | No | Sí (safetensors, GGUF) |
| Arquitectura documentada | No | Sí |
| Evaluación reproducible | No | Sí (benchmarks publicados) |
| Runtime de inferencia | No aplica | vLLM, llama.cpp, TGI, Ollama |
| Procedencia verificable | No | Repositorio y paper del autor |
| Riesgo de ejecución | Alto (binario opaco, contraseña, admin) | Bajo (datos, no código ejecutable) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, compararse ni desplegarse como tal en pipelines de inferencia.
- Binario de procedencia desconocida: el ejecutable se distribuye comprimido con contraseña (`2026`), técnica habitual para dificultar el escaneo estático por parte de antivirus y motores de SmartScreen.
- Instrucción de ejecución como administrador: eleva los privilegios del proceso sin justificación técnica verificable.
- Enlaces de descarga alojados en repositorios de GitHub de terceros ajenos al autor declarado, lo que rompe la cadena de custodia del artefacto.
- Metadatos incoherentes: fecha de creación futura, cero descargas frente a la insignia de "38K+", nombre del ejecutable correspondiente a un script de videojuego y no a un bot de trading.
- Riesgo financiero directo: las funcionalidades declaradas implican manejo de claves privadas y fondos en Solana; ejecutar software no auditado en ese contexto puede provocar la pérdida total de los activos.
- Riesgo de malware: la combinación de contraseña de archivo, ejecución como administrador y distribución fuera de canales oficiales es un patrón recurrente en campañas de infostealers y droppers.
- Licencia MIT declarada, pero irrelevante en la práctica: no hay código fuente ni pesos sobre los que ejercer los derechos de la licencia.
- Sesgos y alucinación: no aplica como modelo; la model card contiene afirmaciones no verificables que funcionan como marketing.
- Recomendación: no descargar ni ejecutar el binario; si se requiere análisis, hacerlo exclusivamente en sandbox aislado y sin credenciales ni carteras accesibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Novedsikhi/gmgn-bullx-photon-copytrade-bot-keyless
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/JisungDiaz447/blox-fruits-script-keyless-2026/releases/download/v1.2.0/blox-fruits-script-keyless-2026-v1.2.2-win64.zip
- Releases citadas en la model card (GitHub de terceros): https://github.com/tomasz5646/gmgn-bullx-photon-copytrade-bot-keyless/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
