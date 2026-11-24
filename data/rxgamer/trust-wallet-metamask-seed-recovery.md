# rxgamer/trust-wallet-metamask-seed-recovery

## Resumen

El repositorio `rxgamer/trust-wallet-metamask-seed-recovery` no contiene un modelo de inteligencia artificial. Se trata de un paquete publicado en Hugging Face que, segun su propia model card, distribuye un ejecutable de Windows (`rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe`) comprimido en un archivo ZIP protegido con contrasena. La etiqueta del repositorio y el texto de la model card lo presentan como una herramienta de "recuperacion de seed" de monederos Trust Wallet y MetaMask, con modulos que describen la reconstruccion de mnemonicos parciales, la validacion de BIP39 y el parseo de keystores LevelDB.

No existe arquitectura de red neuronal, parametros, tokenizador, pesos ni pipeline de inferencia asociados. Los campos habituales de una ficha de modelo (parametros totales, contexto, cuantizacion, formato de pesos) no son aplicables porque el artefacto no es un modelo entrenado, sino un binario ejecutable para Windows x64.

La relevancia de esta ficha es fundamentalmente de advertencia: el contenido encaja con el patron de campanas de malware distribuidas a traves de repositorios de Hugging Face, con instrucciones para desactivar avisos de Windows Defender y SmartScreen y ejecutar el binario como administrador. No debe tratarse como un modelo open source ni evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (declarada en metadatos; no verificable para el binario) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`, no pesos) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo ni proceso de entrenamiento. El artefacto distribuido es un archivo `rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip` de 4,8 MB que, tras extraerse con la contrasena indicada en la model card, contiene un ejecutable para Windows 10 (22H2) y Windows 11 (24H2). La model card menciona modulos internos como un solver de mnemonicos parciales, un validador BIP39 local, un parser de keystores LevelDB y una rotacion de RPC con failover, pero no aporta documentacion tecnica verificable, codigo fuente ni trazabilidad de esos componentes.

No se describe ningun dataset, ninguna fase de preentrenamiento, ajuste supervisado o RLHF. La unica "innovacion" declarada es la operativa del binario, no capacidades de aprendizaje automatico.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no programa y no responde a prompts.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- La model card atribuye al binario funciones de reconstruccion de mnemonicos parciales, validacion BIP39 offline, auditoria de tokens ERC20/SPL y parseo de keystores locales, sin evidencia tecnica que las respalde.
- Multilingue solo a nivel de metadatos del repositorio (14 idiomas listados); no hay interfaz ni capacidad linguistica verificable.

## Casos de uso

No se identifican casos de uso legitimos para este artefacto como modelo de IA. Los escenarios que sugiere la model card son de alto riesgo:

- Recuperacion de frases semilla de monederos de terceros: la model card lo presenta como recuperacion de seed de Trust Wallet y MetaMask, lo que en la practica corresponde a acceso no autorizado a credenciales de terceros.
- Extraccion de keystores de extensiones de navegador: el supuesto parser LevelDB apunta a datos locales de monederos, un vector clasico de robo de credenciales.
- Auditoria de saldos de tokens: la funcionalidad descrita de comprobacion de saldos ERC20/SPL encaja con el reconocimiento previo a un fraude.
- Distribucion de binarios con instrucciones para desactivar Defender: el propio texto pide whitelistear el directorio y ejecutar como administrador, patron habitual de malware.
- Pruebas de seguridad ofensiva: solo tendria cabida en un laboratorio aislado y con autorizacion expresa, algo que la model card no documenta.
- Uso educativo sobre ingenieria social: puede servir para estudiar tecnicas de campanas maliciosas en repositorios de modelos, no para desplegar nada en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de ningun tipo; las cifras que aparecen en la model card (descargas, valoracion, frecuencia de polling) son afirmaciones del autor sin verificacion.

## Requisitos de hardware

- VRAM: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: ninguna; el artefacto es un ejecutable de CPU para Windows x64.
- Cabe en cualquier PC con Windows 10 (22H2) o Windows 11 (24H2); el ZIP ocupa 4,8 MB.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI posibles).
- Latencia y throughput: no disponibles; las cifras de "171 Hz" o "352 Hz" de la model card no son medibles ni contrastables.
- Recomendacion: no ejecutar el binario en ningun equipo, y menos con privilegios de administrador.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Frente a un LLM real de la misma categoria (por ejemplo, un modelo de 7B con licencia permisiva), las diferencias no son de rendimiento sino de naturaleza: aqui no hay pesos, tokenizador, contexto ni inferencia.

| Criterio | Este repositorio | Modelo de IA tipico |
|---|---|---|
| Parametros | no aplica | miles de millones |
| Contexto | no aplica | 4K-128K tokens |
| Pesos en safetensors/GGUF | no | si |
| Evaluacion con benchmarks | no | habitualmente si |
| Riesgo de seguridad | alto (binario opaco) | bajo/medio (pesos auditables) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe catalogarse ni evaluarse como tal.
- Binario opaco distribuido en ZIP con contrasena, sin codigo fuente ni firma verificable.
- La model card pide desactivar o ignorar avisos de Windows Defender y SmartScreen y ejecutar como administrador, indicio claro de comportamiento malicioso.
- El nombre y la funcionalidad declarada (recuperacion de seeds de monederos de terceros) apuntan a robo de credenciales cripto.
- La licencia MIT declarada en metadatos no otorga ninguna garantia sobre el contenido del ejecutable.
- Riesgo de suplantacion: el repositorio referencia otros proyectos de GitHub ajenos y enlaces de descarga externos.
- No usar en produccion, ni en equipos personales, ni con acceso a monederos reales.
- Si se ha ejecutado el binario, se recomienda tratar el sistema como comprometido, rotar credenciales y semillas y analizar el equipo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rxgamer/trust-wallet-metamask-seed-recovery
- Model card del autor (contenido no verificado): incluida en la pagina anterior
- Enlaces de descarga citados en la model card: no se reproducen por seguridad; apuntan a binarios externos no auditados
