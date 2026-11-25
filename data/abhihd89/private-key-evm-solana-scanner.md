# Abhihd89/private-key-evm-solana-scanner

## Resumen

`Abhihd89/private-key-evm-solana-scanner` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una supuesta aplicacion ejecutable para Windows (x64) distribuida como archivo ZIP de 4,8 MB con contrasena, y cuya model card es en realidad un anuncio de descarga con enlaces a repositorios de GitHub de terceros. No contiene pesos, tokenizador, configuracion de arquitectura ni ningun artefacto propio de un modelo de lenguaje.

El material publicitario describe funcionalidades de escaneo de claves privadas para las redes EVM y Solana, validacion local de frases BIP39, resolucion parcial de mnemonicos, rotacion de nodos RPC y parseo de keystores LevelDB. Estas capacidades se presentan como herramientas de "recuperacion", pero en la practica corresponden al patron tipico de utilidades de fuerza bruta sobre material criptografico ajeno, un vector habitual de malware y de robo de fondos.

Desde la perspectiva de evaluacion de modelos, la ficha no puede completarse con datos tecnicos reales porque no existen. Todos los campos de especificaciones, entrenamiento, capacidades, benchmarks y hardware se marcan como no disponibles. La ficha se mantiene por rigor documental y para advertir de que el artefacto no debe ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. No hay transformer, MoE, SSM ni arquitectura hibrida que describir. El repositorio no incluye ficheros de pesos, tokenizador, `config.json`, `generation_config.json` ni scripts de entrenamiento. Los unicos artefactos referenciados son un ZIP de 4,8 MB alojado en GitHub y un binario `.exe` que se debe ejecutar "como administrador" tras extraerlo con la contrasena `2026`.

No existe informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, RLHF, DPO ni ninguna innovacion tecnica de inferencia. Cualquier afirmacion sobre "motor SIMD multi-core", "PBKDF2 hashing" o "15 hilos de trabajo" que aparece en la model card se refiere a supuestas rutinas del ejecutable, no a un modelo entrenado, y no viene acompanada de codigo fuente verificable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de una API de modelo.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues derivadas de un modelo; los idiomas listados son solo etiquetas de metadatos para el anuncio.
- Las unicas "capacidades" declaradas en la model card son funcionalidades del ejecutable: validacion BIP39, exportacion de balances, resolucion parcial de mnemonicos, rotacion de RPC y parseo de keystores LevelDB.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.

## Casos de uso

No se identifican casos de uso legitimos para un modelo de IA, porque no lo es. Los escenarios que describe la propia model card son los siguientes, y se documentan unicamente a efectos de analisis de riesgo:

- Validacion local de frases BIP39: el ejecutable afirmaria verificar entropy y checksum de 12, 18 y 24 palabras de forma offline. Un uso legitimo equivalente se cubre con librerias auditadas como `bip39` o `bitcoinjs-lib` en lugar de un binario cerrado.
- Exportacion de balances a informes locales: la model card lo presenta como registro de "hits no nulos". En la practica implica comprobar saldos de direcciones derivadas de claves ajenas.
- Resolucion parcial de mnemonicos: reconstruccion de palabras faltantes o danadas. Solo es defendible sobre material propio y con herramientas de codigo abierto auditables.
- Rotacion de nodos RPC entre Alchemy, Helius y QuickNode: automatizacion de consultas a nodos para evitar limites de tasa. Se puede implementar con clientes oficiales y sin binarios de terceros.
- Parseo de keystores LevelDB de extensiones de navegador: acceso a ficheros `.ldb` y vaults locales. Cualquier herramienta que haga esto sobre un equipo que no es propio constituye acceso no autorizado a datos.
- Distribucion como "descarga gratuita para Windows": el caso de uso real del repositorio es la distribucion de un ejecutable con contrasena y enlaces a repos de GitHub ajenos al autor declarado, un patron clasico de cadena de suministro maliciosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, porque no hay modelo que evaluar. Las cifras que aparecen en la model card (`98,2%` de consistencia, `98,5%` de consistencia, `<53 MB` de RAM) son afirmaciones de marketing sin metodologia, sin conjunto de validacion y sin reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto no es compatible con ningun runtime de inferencia.
- Requisitos declarados del ejecutable: Windows 10/11 de 64 bits, 4,8 MB de archivo ZIP, extraccion con contrasena `2026` y ejecucion como administrador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos" comparable porque el artefacto no es un modelo. Frente a utilidades legitimas de gestion de claves (por ejemplo, carteras de codigo abierto auditadas o librerias criptograficas estandar), la diferencia relevante es que este repositorio no publica codigo fuente, exige privilegios de administrador y se distribuye con contrasena, lo que impide cualquier auditoria.

| Criterio | Este repositorio | Libreria criptografica auditada (referencia generica) |
|---|---|---|
| Naturaleza | Ejecutable Windows cerrado | Codigo fuente abierto |
| Pesos o modelo | No | No aplica |
| Codigo fuente publico | No | Si |
| Auditoria posible | No | Si |
| Licencia | MIT declarada | Variable, habitualmente MIT/Apache-2.0 |
| Riesgo de cadena de suministro | Alto | Bajo si se fija la version y se verifica el hash |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluacion como modelo de lenguaje carece de sentido y los campos tecnicos quedan vacios por ausencia de artefactos.
- La model card incluye enlaces de descarga a repositorios de GitHub (`ekaterina96522/fisch-script-auto-catch-macro`, `gchaudhry35057/private-key-evm-solana-scanner`) que no coinciden con el autor del repo en Hugging Face, un indicio de suplantacion o de cadena de suministro comprometida.
- El binario se distribuye dentro de un ZIP protegido con contrasena y se pide ejecutarlo como administrador: dos practicas que dificultan el analisis antivirus y elevan el impacto de cualquier payload.
- Las funcionalidades descritas (escaneo de claves privadas, resolucion de mnemonicos, parseo de keystores de terceros) son incompatibles con un uso licito sobre material ajeno y pueden constituir delito en la mayoria de jurisdicciones.
- La licencia MIT declarada en los metadatos no otorga ninguna garantia sobre el contenido; el autor no publica codigo fuente que pueda acogerse a ella.
- Riesgo alto de malware: ejecutables de este tipo se asocian habitualmente a infostealers, clippers de portapapeles y ransomware.
- Cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento ni issues publicos.
- No debe desplegarse en produccion, ni en equipos personales, ni en entornos con acceso a carteras o credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Abhihd89/private-key-evm-solana-scanner
- Repositorio de GitHub referenciado en la model card (autor distinto al del repo de HF): https://github.com/gchaudhry35057/private-key-evm-solana-scanner
- Repositorio de GitHub del supuesto binario: https://github.com/ekaterina96522/fisch-script-auto-catch-macro
- Enlace de descarga citado en la model card: https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Paper, blog o demo oficial: no disponible
