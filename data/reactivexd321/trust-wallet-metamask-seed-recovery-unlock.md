# ReactivexD321/trust-wallet-metamask-seed-recovery-unlock

## Resumen

No existe ningun modelo de IA open source en el repositorio `ReactivexD321/trust-wallet-metamask-seed-recovery-unlock`. El artefacto publicado es un binario ejecutable para Windows x64 (`lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB), distribuido con contrasena y alojado en un repositorio de GitHub de terceros. No contiene pesos, tokenizador, configuracion de arquitectura ni ningun otro componente propio de un modelo de lenguaje.

La model card no describe un modelo de IA: presenta una supuesta herramienta de "recuperacion de semillas" de Trust Wallet y MetaMask, con funciones declaradas como derivacion multi-cadena (BIP39/BIP44/BIP84), validacion local de frases semilla, parseo de keystores LevelDB y rotacion de RPC. Estas capacidades, en el contexto de monederos de criptomonedas, corresponden a la descripcion clasica de una herramienta de extraccion de claves privadas, no a un modelo de aprendizaje automatico.

Esta ficha se redacta unicamente para dejar constancia de la naturaleza del artefacto y advertir de los riesgos. No se puede evaluar como modelo porque no lo es, y no se recomienda su descarga ni ejecucion bajo ninguna circunstancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, sin relacion con capacidades linguisticas reales) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario compilado para Windows 10/11 de 64 bits que, segun la model card, se ejecuta "como administrador" y requiere una contrasena (`2026`) para descomprimirse. La descripcion mezcla terminologia ajena al dominio (referencias a DLSS, "lossless-scaling") con funciones propias de extraccion de claves de monederos, lo que sugiere un paquete ensamblado para aparentar legitimidad tecnica.

No se documenta ningun dataset, ningun proceso de RLHF/DPO ni innovacion de inferencia. Toda la informacion disponible sobre "arquitectura" es marketing del autor y no verificable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No tiene modo "thinking", vision, audio ni capacidades multimodales.
- Las unicas "capacidades" declaradas son operaciones sobre material criptografico de monederos (derivacion de direcciones, validacion BIP39, lectura de keystores LevelDB), que constituyen precisamente el vector de riesgo.
- El etiquetado multilingue de la model card no implica soporte linguistico real; es relleno de metadatos.

## Casos de uso

- Ninguno recomendado. No existe un caso de uso legitimo para ejecutar un binario sin firma, distribuido con contrasena, que afirma manipular frases semilla de monederos de criptomonedas.
- Auditoria de seguridad defensiva: un analista podria estudiar el artefacto en un entorno aislado y sin red para documentar tecnicas de ingenieria social, pero nunca ejecutandolo en una maquina con acceso a fondos o credenciales.
- Formacion en concienciacion: sirve como ejemplo de repositorio de Hugging Face con metadatos de modelo que en realidad distribuye malware.
- No es adecuado para atencion al cliente, generacion de codigo, analisis de datos, RAG, agentes ni ninguna otra aplicacion de IA.
- No debe integrarse en pipelines de CI/CD ni en entornos de produccion.
- No debe usarse para "recuperar" monederos propios: la recuperacion legítima de una semilla se hace con la propia aplicacion oficial del monedero y la frase de recuperacion original, nunca con herramientas de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`< 28 MB` de RAM, `< 51 MB` de RAM, `16` hilos, `98,9%` de consistencia, `< 12 ms` de respuesta) son afirmaciones del autor sin metodologia ni verificacion, y no corresponden a ninguna evaluacion de modelo.

## Requisitos de hardware

- Sistema operativo declarado: Windows 10/11 x64.
- VRAM: no aplica (no hay inferencia de red neuronal).
- GPU recomendadas: no aplicable.
- Cabe en cualquier PC con Windows x64, lo cual no es un merito sino un indicador de que no es un modelo.
- Opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI: no aplicables.
- Latencia y throughput: no disponibles ni relevantes.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el artefacto no es un modelo. Cualquier comparacion con LLM open source (Llama, Mistral, Qwen, Gemma) seria categoricamente incorrecta.

## Limitaciones y advertencias

- Riesgo alto de malware: ejecutable sin firma, distribuido con contrasena para evadir analisis automatizado, alojado en un repositorio de GitHub ajeno al autor declarado.
- Suplantacion de identidad: usa nombres de marcas registradas (Trust Wallet, MetaMask) sin autorizacion, lo que constituye una infraccion de marca y una senal de fraude.
- Ingenieria social: la promesa de "recuperar semillas" es el gancho tipico de estafas dirigidas a usuarios de criptomonedas; el objetivo probable es el robo de fondos.
- Incumplimiento de las politicas de Hugging Face: los repositorios que distribuyen binarios ajenos al ecosistema de modelos, especialmente con fines potencialmente ilicitos, violan las condiciones de uso de la plataforma.
- Sin trazabilidad: el ZIP apunta a un repositorio de GitHub (`Hiroshis198/...`) distinto del autor del modelo, lo que impide verificar procedencia.
- Licencia MIT irrelevante: una licencia declarada en metadatos no legitima el contenido ni exime de responsabilidad legal por el uso de software malicioso.
- Recomendacion: no descargar, no descomprimir, no ejecutar. Reportar el repositorio a Hugging Face. Si se ha ejecutado, tratar la maquina como comprometida, desconectar de la red, rotar credenciales y trasladar los fondos de los monederos afectados a direcciones nuevas generadas en un dispositivo limpio.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/ReactivexD321/trust-wallet-metamask-seed-recovery-unlock
- Repositorio de GitHub referenciado en la model card: https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026
- Repositorio de GitHub referenciado en la model card: https://github.com/Janb2081/trust-wallet-metamask-seed-recovery-unlocked
- No se han encontrado papers, blogs, demos ni documentacion tecnica legitima asociados a este artefacto.
