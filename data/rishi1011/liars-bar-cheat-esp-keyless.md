# rishi1011/liars-bar-cheat-esp-keyless

## Resumen

El repositorio `rishi1011/liars-bar-cheat-esp-keyless` no contiene un modelo de inteligencia artificial ni pesos entrenados. Se trata de un paquete de software malicioso distribuido a traves de Hugging Face que se presenta como una herramienta de trucos ("cheat") con ESP (extra-sensorial perception) para el videojuego Liar's Bar, empaquetada como ejecutable portable para Windows 10/11 x64. El contenido de la model card es un artefacto de spam/SEO que mezcla referencias a un supuesto "sniper bot" de criptomonedas (`pump-fun-jito-bundler-sniper-bot-2026`) con enlaces de descarga alojados en repositorios de GitHub de terceros.

No existe arquitectura de red neuronal, parametros, contexto, tokenizador ni dataset de entrenamiento asociado. Los tags del repositorio (`windows`, `x64`, `portable`) y la ausencia de pipeline confirman que no se trata de un modelo publicable en el ecosistema de Hugging Face. La ficha que sigue documenta el artefacto tal como aparece, senalando explicitamente la ausencia de datos tecnicos verificables y los riesgos de seguridad asociados a su descarga y ejecucion.

La relevancia de esta ficha es, por tanto, como caso de estudio de contaminacion de repositorios y de distribucion de binarios potencialmente peligrosos bajo apariencia de modelo open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin relacion con capacidades del binario) |
| Licencia | MIT (declarada en metadatos; el binario no incluye codigo fuente) |
| Formato de pesos | no disponible; el artefacto distribuido es un `.zip` de 4,8 MB con un `.exe` en su interior |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto es un binario ejecutable para Windows x64 empaquetado en un archivo ZIP de 4,8 MB, con contrasena de extraccion `2026`, y referenciado con el nombre `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`. La model card describe modulos de "overlay externo a 144 Hz", "scanner de offsets dinamicos", "radar 2D" y "smoothing de entrada Bezier", todos ellos propios de un cheat de videojuego, no de un modelo de lenguaje.

No hay informacion sobre datos de entrenamiento, tokens, RLHF, DPO ni innovaciones tecnicas de IA. El texto de la model card mezcla terminologia de trading de criptomonedas (pump-fun, jito, bundler, sniper) con la de cheats de juego, lo que sugiere una plantilla reutilizada para distribuir binarios bajo multiples disfraces. Los enlaces de descarga apuntan a repositorios de GitHub ajenos al autor declarado (`carlos7088`, `MichelChevalier09`), no al espacio de Hugging Face del usuario `rishi1011`.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los idiomas listados son metadatos SEO.
- El binario afirma implementar un overlay de ESP para el juego Liar's Bar (cajas 2D/3D, esqueletos, distancia), un radar 2D con filtro de loot, un "panic key" (`END`) y un scanner de offsets.
- Estas capacidades no son verificables y, en cualquier caso, constituyen trampas en un videojuego multijugador, con el riesgo de baneo y de malware que ello implica.

## Casos de uso

- Ninguno legitimo en el ambito de IA, desarrollo o investigacion.
- Auditoria de seguridad: analizar el binario en un entorno aislado (sandbox, VM sin red) para caracterizar la amenaza y generar firmas.
- Estudio de contaminacion de repositorios: documentar como se abusa de Hugging Face para alojar y promocionar binarios no relacionados con modelos.
- Formacion en ciberseguridad: usar la model card como ejemplo de ingenieria social (contrasena en el ZIP, "run as Administrator", enlaces a repositorios de terceros).
- Respuesta a incidentes: si un usuario ha ejecutado el binario, revisar persistencia, procesos hijos y trafico de red saliente.
- Moderacion de plataformas: alimentar clasificadores de contenido para detectar patrones de spam en model cards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable con MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- No requiere GPU ni VRAM: es un ejecutable de Windows x64.
- Requisitos declarados en la model card: Windows 10/11 de 64 bits, procesador Intel o AMD x64.
- Consumo de RAM declarado por el autor: menos de 24 MB para la capa de render y menos de 56 MB para el radar (cifras no verificadas).
- No cabe en el paradigma de despliegue de modelos: no se sirve con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las menciones a "144 Hz" y "worker threads" son afirmaciones de marketing sin medicion.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rishi1011/liars-bar-cheat-esp-keyless` | Binario Windows (cheat) | no aplica | no aplica | MIT declarada | Hugging Face + enlaces a GitHub de terceros |
| Modelo de lenguaje open source tipico (p. ej. familia Llama, Qwen, Mistral) | Modelo transformer | Miles de millones | Miles de tokens | Licencias especificas (Llama, Apache 2.0, etc.) | Hugging Face, con pesos safetensors/GGUF |
| Repositorio de utilidades Windows legitimo | Software | no aplica | no aplica | MIT/GPL | GitHub con codigo fuente |

No existe comparacion tecnica posible con modelos de IA porque el artefacto no lo es. La comparativa se limita a contrastar su naturaleza (binario cerrado sin fuente) frente a modelos y software legitimos.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier uso esperando capacidades de lenguaje, codigo o razonamiento fracasara.
- Riesgo alto de malware: binario cerrado, sin codigo fuente, distribuido con contrasena y con instrucciones de ejecutar como Administrador, patron clasico de troyano o infostealer.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros no verificados, lo que impide atribuir el binario al autor del repositorio de Hugging Face.
- La licencia MIT declarada no aporta garantias sobre el binario ni sobre su procedencia.
- Uso en produccion desaconsejado en cualquier escenario; si se manipula, hacerlo exclusivamente en sandbox aislado y sin credenciales.
- El uso de cheats en Liar's Bar viola previsiblemente los terminos de servicio del juego y puede conllevar baneo de cuenta.
- Los metadatos multilingues y los tags son SEO y no reflejan capacidades reales.
- No hay issues, descargas ni likes que permitan validacion comunitaria; el repositorio se creo y actualizo el mismo dia (2026-11-24).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rishi1011/liars-bar-cheat-esp-keyless
- Enlace de descarga citado en la model card (GitHub de terceros, no verificado): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
- Repositorio de releases citado en la model card (GitHub de terceros, no verificado): https://github.com/MichelChevalier09/liars-bar-cheat-esp-keyless/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
