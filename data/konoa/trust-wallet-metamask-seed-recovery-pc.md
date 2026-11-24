# Konoa/trust-wallet-metamask-seed-recovery-pc

## Resumen

El repositorio `Konoa/trust-wallet-metamask-seed-recovery-pc` no contiene un modelo de inteligencia artificial. Se trata de una publicacion en Hugging Face que distribuye un supuesto ejecutable para Windows de 64 bits (un archivo `.exe` empaquetado en un `.zip` de 4,8 MB), presentado como herramienta de "recuperacion de seed" de monederos Trust Wallet y MetaMask. El autor es el usuario `Konoa`, con cero descargas y cero likes en el momento de la consulta, y la model card emplea un lenguaje de marketing propio de software de escritorio, no de modelos fundacionales.

El contenido no describe ninguna arquitectura neuronal, parametros, ventana de contexto ni proceso de entrenamiento. Los campos de Hugging Face que normalmente identifican un modelo (pipeline, formato de pesos, familia) estan vacios o son incoherentes con la etiqueta de licencia MIT. La model card mezcla el nombre del supuesto producto con nombres de archivo ajenos (referencias a un "trainer" de un videojuego), enlaces a repositorios de GitHub de terceros y una contrasena de descompresion, lo que constituye un patron tipico de distribucion de malware disfrazado de utilidad.

Por tanto, esta ficha no puede evaluar capacidades tecnicas de un modelo porque no las hay. Lo que se documenta a continuacion es la naturaleza del artefacto, sus riesgos de seguridad y las advertencias necesarias para cualquier desarrollador o investigador que se encuentre con este repositorio. La recomendacion tecnica es no descargar, extraer ni ejecutar el archivo distribuido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (se distribuye un `.zip` con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un binario compilado para Windows x64 que, segun la model card, se ejecuta con privilegios de administrador y requiere una contrasena ("2026") para descomprimirse. La card menciona modulos internos como un "solver de mnemonicos parciales", un motor "SIMD multi-core" con PBKDF2, derivacion BIP44/BIP84, rotacion de RPC y un parser de LevelDB, pero no aporta codigo fuente, hashes verificables, firma digital ni repositorio publico auditable.

La unica innovacion tecnica que se puede inferir del texto es la ingenieria social: el uso de insignias de "build", contadores de descargas falsos, referencias cruzadas a repositorios de GitHub ajenos y una contrasena de descompresion que evita el analisis automatico por parte de antivirus y sandboxes. No hay dataset, tokens de entrenamiento, RLHF ni DPO porque no hay modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de un LLM; los idiomas listados son metadatos de la publicacion.
- El supuesto binario afirma realizar recuperacion de mnemonicos parciales, derivacion de direcciones en EVM, Solana y Bitcoin, y auditoria de saldos ERC20/SPL, pero ninguna de estas funciones esta verificada ni es auditable.
- No hay modo "thinking", vision ni audio.

## Casos de uso

- Ninguno recomendado. El artefacto no es apto para produccion, investigacion ni uso personal.
- Auditoria de seguridad defensiva: un analista puede usar este repositorio como ejemplo de campana de ingenieria social para formar a equipos en la deteccion de malware disfrazado de herramienta cripto.
- Analisis de indicadores de compromiso: los nombres de archivo, la contrasena de descompresion y los enlaces a GitHub de terceros sirven como firmas para reglas de deteccion en SIEM o EDR.
- Formacion en higiene de cadena de suministro: ilustra por que no se deben ejecutar binarios sin firma ni hash publicado desde repositorios de modelos.
- Estudio de tecnicas de evasion: muestra como el empaquetado con contrasena y los nombres de archivo ajenos al producto dificultan el escaneo automatico.
- Documentacion de riesgos para equipos de compliance: permite justificar politicas de bloqueo de descargas desde Hugging Face cuando el artefacto no es un modelo.
- No se debe usar para recuperar monederos reales: ejecutarlo con una seed o frase semilla legitima expone las claves al binario y a cualquier operador que lo haya distribuido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplica: no hay modelo que evaluar con MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, procesadores Intel o AMD x64, ejecucion como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; el autor afirma uso de memoria inferior a 55 MB y 43 MB en modulos concretos, sin evidencia verificable.

## Comparativa con modelos similares

| Criterio | `Konoa/trust-wallet-metamask-seed-recovery-pc` | Modelo LLM open source tipico (p. ej. familia Llama, Qwen, Mistral) | Herramienta legítima de recuperacion de monederos (p. ej. Ian Coleman BIP39, software oficial de la wallet) |
|---|---|---|---|
| Naturaleza | Binario Windows empaquetado | Pesos neuronales en safetensors/GGUF | Codigo fuente auditable o binario firmado |
| Parametros | no disponible | Miles de millones | no aplica |
| Contexto | no disponible | 8k-128k tokens | no aplica |
| Rendimiento medible | no disponible | Benchmarks publicos | no aplica |
| Licencia | MIT declarada | MIT, Apache 2.0, Llama Community, etc. | MIT, GPL o propietaria |
| Auditabilidad | Nula (sin fuente ni hash) | Alta (pesos y card publicos) | Alta si es codigo abierto |
| Disponibilidad | Hugging Face, 0 descargas | Hugging Face, amplia adopcion | GitHub, web oficial |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generacion de texto, razonamiento o codigo es infundada.
- Riesgo alto de malware: un ejecutable de origen desconocido, protegido con contrasena y que pide privilegios de administrador es un vector clasico de troyanos, infostealers y ransomware.
- Riesgo de robo de fondos: si se introduce una frase semilla real, el binario puede exfiltrarla; la promesa de "recuperar" seeds es incompatible con la seguridad de cualquier monedero.
- Senales de manipulacion: contadores de descargas inflados, insignias de build inventadas, referencias a repositorios de GitHub ajenos y nombres de archivo que no coinciden con el producto.
- Licencia MIT declarada sin archivo LICENSE verificable ni titular claro; no cubre responsabilidad alguna sobre el binario.
- Idiomas listados sin traduccion real de la documentacion; la card esta en ingles con fragmentos en otros idiomas.
- Sin hash, sin firma digital, sin codigo fuente y sin historial de versiones creible.
- Cualquier uso en produccion, investigacion o gestion de activos digitales debe evitarse; si ya se ha ejecutado, se recomienda rotar todas las semillas y claves expuestas y analizar el equipo con herramientas forenses.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Konoa/trust-wallet-metamask-seed-recovery-pc
- Enlace de descarga citado en la card (no recomendado): https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026/releases/download/v1.2.0/elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la card (no verificado): https://github.com/sidorov4181/trust-wallet-metamask-seed-recovery-pc/releases/latest
- Paper, blog o demo oficial: no disponible.
