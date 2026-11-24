# morte01/gmgn-bullx-photon-copytrade-bot-portable

## Resumen

El repositorio `morte01/gmgn-bullx-photon-copytrade-bot-portable` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows cuyo contenido declarado es un supuesto bot de copytrading para plataformas de trading de criptomonedas (GMGN, Bullx, Photon), empaquetado como un ejecutable portable de 4,8 MB. No hay pesos, ni tokenizador, ni configuración de arquitectura neuronal en la informacion disponible.

La model card no describe ninguna arquitectura de aprendizaje automatico: habla de "multi-tier take profit", "Jito & MEV bundle engine", "local AES-256 key vault" y "pre-buy honeypot filter", es decir, funcionalidades propias de una herramienta de trading automatizado, no de un modelo de lenguaje o multimodal. El pipeline no esta definido y las descargas y likes son cero en el momento de la consulta.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA. Lo que se documenta a continuacion es la naturaleza real del repositorio, sus especificaciones declaradas y las advertencias de seguridad pertinentes, dado que la distribucion de ejecutables de origen desconocido con contrasena en el archivo comprimido y ejecucion como administrador constituye un patron de riesgo relevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un `.zip` de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura neuronal ni proceso de entrenamiento documentado. El artefacto es un binario Windows (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build declarada `v2.1.6` / `5C0BE2`) empaquetado en un ZIP de 4,8 MB protegido con la contrasena `2026`. La model card menciona modulos de trading (enrutado de ordenes por WebSocket y gRPC, sandbox de paper trading, gestor de claves AES-256 local, filtro de honeypots), pero no aporta ningun detalle sobre implementacion, dependencias, cadena de compilacion ni verificacion de integridad.

No hay informacion sobre datos de entrenamiento, RLHF, DPO ni innovaciones tecnicas de inferencia. La nomenclatura del ejecutable (`schedule-1-cheat-trainer`) no coincide con el nombre del repositorio, lo que sugiere reutilizacion de un paquete ajeno o un renombrado del binario sin trazabilidad.

## Capacidades

- No es un modelo generativo: no hay generacion de texto, razonamiento, codigo, matematicas ni vision.
- No hay soporte de tool calling ni de function calling en el sentido de modelos de lenguaje.
- No hay capacidades de agente ni de razonamiento multi-paso basadas en un LLM.
- El multilingue se limita a etiquetas de metadatos del repositorio; no se documenta ningun procesamiento de lenguaje natural.
- Funcionalidades declaradas por el autor (no verificadas): take profit multinivel, sandbox de paper trading, motor de bundles Jito/MEV, enrutado de ordenes con latencia declarada inferior a 40 ms, gestor local de claves AES-256 y filtro pre-compra de honeypots.

## Casos de uso

- No aplica como modelo de IA: no se puede emplear para generacion de texto, codigo, atencion al cliente, RAG ni ninguna tarea de inferencia neuronal.
- Auditoria de seguridad de artefactos: el repositorio sirve como caso de estudio de distribucion de ejecutables con contrasena y solicitud de privilegios de administrador, patron habitual en campanas de malware.
- Analisis de model cards enganosas: util para estudiar como un repositorio etiquetado con metadatos de modelo puede alojar en realidad un binario sin relacion con IA.
- Formacion en higiene de cadena de suministro: ejemplo de por que conviene verificar hashes, firmas y origen antes de ejecutar binarios descargados de Hugging Face.
- Trazabilidad de repositorios: permite comprobar como un mismo paquete aparece bajo nombres de proyecto distintos, lo que dificulta la atribucion.
- No se recomienda su uso operativo en trading real: no hay evidencia de funcionamiento, soporte ni garantias, y el riesgo de perdida de fondos o de compromiso del sistema es alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (menos de 39 MB de RAM, menos de 28 ms de respuesta, 99,3 % de consistencia, menos de 36 ms de enrutado, menos de 13 ms de acceso al vault) son afirmaciones del autor sin metodologia, sin entorno de prueba ni verificacion independiente, por lo que no se recogen como resultados medidos.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits, segun la model card.
- VRAM: no aplica; no hay inferencia neuronal.
- GPU recomendadas: no disponible; el autor no menciona requisitos de GPU.
- RAM: el autor declara un uso inferior a 39 MB, cifra no verificada.
- Almacenamiento: el archivo comprimido ocupa 4,8 MB; el espacio descomprimido no se especifica.
- Opciones de despliegue: ejecucion directa del `.exe` como administrador; no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no es un modelo.
- Latencia y throughput: no disponibles de forma fiable; las cifras del autor carecen de respaldo.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos similares" porque el artefacto no es un modelo de IA. Como referencia de contraste, un modelo de lenguaje pequeno real (por ejemplo, de 1 a 3 mil millones de parametros) se distribuiria en safetensors o GGUF con pesos de varios cientos de MB a varios GB, frente a los 4,8 MB de este paquete, que corresponde a un binario ejecutable.

## Limitaciones y advertencias

- No es un modelo de IA: la ficha de Hugging Face y los metadatos inducen a confusion, pero el contenido es un ejecutable de Windows.
- Riesgo de malware: un binario sin firma, distribuido en un ZIP con contrasena y que solicita ejecucion como administrador, es un vector clasico de infeccion. No se debe ejecutar en un equipo de produccion ni en un sistema con carteras de criptomonedas.
- Inconsistencia de nombres: el ejecutable se llama `schedule-1-cheat-trainer-v1.2.2-win64.exe` mientras que el repositorio se anuncia como bot de copytrading, lo que apunta a reempaquetado o suplantacion.
- Cero descargas y cero likes: no hay comunidad, issues ni evidencia de uso legitimo.
- Licencia MIT declarada, pero sin archivo de licencia verificable ni titular claro; cualquier uso comercial queda sujeto a la responsabilidad de quien lo ejecute.
- Riesgo financiero: si el binario realizara operaciones de trading, no hay auditoria, ni gestion de claves verificada, ni garantia de que no exfiltre material criptografico.
- Alucinacion y sesgos: no aplica al no ser un modelo generativo; el equivalente aqui es la afirmacion de capacidades no contrastadas en la model card.
- Idiomas: las etiquetas multilingues no implican soporte real de interfaz o de procesamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/morte01/gmgn-bullx-photon-copytrade-bot-portable
- Repositorio GitHub referenciado en la model card: https://github.com/gchaudhry35057/gmgn-bullx-photon-copytrade-bot-portable
- Recurso de descarga citado (no verificado): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- No se han encontrado papers, blogs tecnicos ni demos asociados en la informacion disponible.
