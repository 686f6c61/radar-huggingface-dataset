# RobbieTech1/metro-exodus-cheat-trainer

## Resumen

`RobbieTech1/metro-exodus-cheat-trainer` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete binario para Windows x64 (build `v2.2.7`, identificador `008D01`) distribuido como un archivo ZIP de 4,8 MB protegido con contraseña, que se presenta como un "cheat trainer" para el videojuego Metro Exodus. El autor lo etiqueta con licencia MIT y una lista de 14 idiomas, pero la model card no describe ningún artefacto de aprendizaje automatico: no hay pesos, ni arquitectura, ni tokenizador, ni pipeline declarado.

El contenido real de la model card es material promocional de descarga de un ejecutable (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe`) alojado en un repositorio de GitHub de terceros, con instrucciones para descomprimir el ZIP con la contraseña `2026` y ejecutarlo como administrador. La propia tarjeta menciona funciones de "validacion BIP39", "derivacion multi-chain", "rotacion RPC" y "parser de keystore LevelDB", es decir, funcionalidades propias de una herramienta de criptomonedas, lo que resulta incoherente con el nombre del paquete y con el juego al que alude.

Por tanto, esta ficha documenta un artefacto que **no es evaluable como modelo de IA**. No existe informacion tecnica verificable sobre parametros, contexto, entrenamiento o benchmarks. Se recomienda precaucion maxima: la combinacion de ejecutable sin firma, contrasena en el archivo, instrucciones para desactivar avisos de SmartScreen y contenido que no coincide con el nombre son indicios clasicos de distribucion de software potencialmente malicioso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun etiquetas del autor) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que documentar. El repositorio no incluye pesos en safetensors, GGUF ni ningun otro formato de modelo. El artefacto descrito en la model card es un binario compilado para Windows 10/11 de 64 bits, empaquetado en un ZIP de 4,8 MB con contrasena, y un ejecutable auxiliar denominado `monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe`. La tarjeta menciona de forma generica "SIMD multi-core engine", "PBKDF2 hashing" y "BIP44/BIP84 address generation", terminos asociados a derivacion de claves de cartera de criptomonedas, no a inferencia de modelos.

No hay informacion sobre volumen de datos de entrenamiento, composicion del corpus, tecnicas de alineacion (RLHF, DPO) ni innovaciones de atencion o decodificacion. Cualquier dato de este tipo seria inventado y, por tanto, se omite.

## Capacidades

- No se ha documentado ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni razonamiento multi-paso.
- Las capacidades multilingues declaradas (14 idiomas) son etiquetas del autor sin respaldo tecnico verificable.
- La model card describe funciones de utilidad de escritorio (validacion BIP39, derivacion de direcciones, rotacion de RPC, exportacion de balances, parser de keystore LevelDB), no capacidades de un modelo de lenguaje.

## Casos de uso

No es posible proponer casos de uso legitimos de un modelo de IA porque el artefacto no lo es. Los escenarios que la propia tarjeta sugiere (ejecutar un binario como administrador tras descomprimir un ZIP con contrasena) no constituyen un uso recomendable en ningun entorno de desarrollo o investigacion. Se enumeran a continuacion unicamente para dejar constancia de lo que el autor declara, sin que ello implique recomendacion alguna:

- Ejecucion de un "trainer" de juego en Windows: el autor lo presenta como utilidad para Metro Exodus, aunque el ejecutable lleva el nombre de otro juego (Monster Hunter Wilds), lo que genera desconfianza sobre su proposito real.
- Validacion local de frases BIP39: segun la tarjeta, verificaria entropia y checksum de 12/18/24 palabras de forma offline.
- Derivacion de direcciones multi-chain: generacion de direcciones BIP44/BIP84 para EVM, Solana y Bitcoin, segun el autor.
- Rotacion de nodos RPC: conmutacion automatica entre proveedores como Alchemy, Helius y QuickNode.
- Exportacion de balances: registro local de direcciones con saldo no nulo en informes.
- Parseo de keystores LevelDB: extraccion local de datos de extensiones de navegador, segun la tarjeta.

Ninguno de estos casos se ha verificado y varios de ellos (parseo de keystores, derivacion masiva de direcciones) son patrones habituales en herramientas de drenaje de carteras. No deben desplegarse en produccion ni en equipos con acceso a credenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento propias (por ejemplo, "98,5 % de consistencia", "395 Hz de polling", "< 9 ms de respuesta", "< 61 MB de RAM") que no son comparables con metricas de modelos de IA y no cuentan con metodologia reproducible.

## Requisitos de hardware

- VRAM estimada: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits, sobre CPU Intel o AMD x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: las cifras de la tarjeta (395 Hz, 288 Hz, 208 Hz) no son verificables ni corresponden a inferencia de un modelo.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos de IA con la que comparar este artefacto. Los unicos elementos comparables serian otros paquetes binarios de dudosa procedencia, lo que queda fuera del alcance de esta ficha.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, configuracion, tokenizador ni pipeline.
- Incoherencia entre el nombre del paquete (Metro Exodus) y el del ejecutable distribuido (Monster Hunter Wilds), lo que sugiere reutilizacion de plantillas o suplantacion.
- Distribucion de un `.exe` sin firma a traves de un ZIP con contrasena y con instrucciones para desactivar SmartScreen y ejecutar como administrador: patron de riesgo elevado.
- La model card mezcla terminologia de videojuegos con funciones de cartera de criptomonedas (BIP39, BIP44, LevelDB keystore), lo que apunta a una posible herramienta de robo de credenciales.
- Cero descargas y cero "likes" en el momento de la consulta, sin historial de mantenimiento.
- Licencia MIT declarada, pero sin que exista codigo fuente en el repositorio que la respalde.
- No debe ejecutarse en equipos de trabajo, servidores de CI/CD ni maquinas con acceso a carteras o credenciales.
- No se ha verificado ninguna de las capacidades ni metricas declaradas por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RobbieTech1/metro-exodus-cheat-trainer
- Repositorio GitHub citado en la tarjeta: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod
- Repositorio GitHub alternativo citado: https://github.com/HarukiSiekiera09/metro-exodus-cheat-trainer
- Enlace de descarga directa citado en la tarjeta (no recomendado): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Paper, blog o demo oficial: no disponible.
