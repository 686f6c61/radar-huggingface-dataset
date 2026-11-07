# edoggy/poc-coder-7b-v1

## Resumen

poc-coder-7b-v1 es un ajuste fino (LoRA) de Qwen/Qwen2.5-Coder-7B-Instruct desarrollado por el usuario edoggy, orientado a la generacion de pruebas de concepto (PoC) en Foundry para vulnerabilidades de contratos inteligentes en Solidity. El modelo recibe la descripcion de un bug y el entorno de pruebas del proyecto, y produce un borrador de test en Foundry que intenta demostrar el fallo. Su proposito no es descubrir bugs, sino materializar en codigo una vulnerabilidad ya identificada, reduciendo el trabajo mecanico de escribir el test.

El modelo se distribuye con licencia Apache 2.0, pesos en safetensors y GGUF, y un total de 7.615.616.512 parametros, heredados de la arquitectura de Qwen2.5-Coder-7B-Instruct. Esta pensado para ejecucion local mediante Ollama, lo que permite mantener el codigo del proyecto auditado fuera de servicios en la nube. El autor lo presenta explicitamente como una herramienta de borradores: los tests generados deben revisarse y completarse manualmente.

La relevancia actual del modelo es acotada y debe interpretarse con cautela. En la evaluacion publicada por el propio autor sobre 37 bugs de 15 proyectos no vistos en entrenamiento, el modelo no consiguio demostrar ninguno (0 pruebas validadas manualmente), con una puntuacion media de progreso de 0,78 sobre 5 y 18 errores de compilacion, cifras peores que las de su modelo base en progreso y compilacion. Se trata, por tanto, de un experimento de nicho dentro del ecosistema de seguridad Web3, no de una herramienta de auditoria autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible en el repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7.615.616.512 parametros, y se obtiene mediante un ajuste LoRA sobre dicho modelo base. El conjunto de entrenamiento lo componen 58 PoCs procedentes de 47 proyectos, extraidos de informes publicos de Code4rena y Sherlock. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales.

No se documentan innovaciones arquitectonicas propias: el modelo hereda la arquitectura y el tokenizador del modelo base. La especializacion se limita al dominio de tests de Foundry para contratos Solidity, y el autor restringe el alcance a proyectos Foundry, sin soporte declarado para otros frameworks de testing.

## Capacidades

- Generacion de tests en Foundry (`*.t.sol`) a partir de una descripcion textual de un bug y del entorno de pruebas del proyecto.
- Redaccion de codigo Solidity dentro del contexto de pruebas de contratos inteligentes.
- Razonamiento sobre vulnerabilidades descritas por el usuario (no las descubre de forma autonoma).
- Conversacion multi-turno (etiqueta `conversational` en el repositorio).
- Ejecucion local mediante Ollama, con los datos del proyecto sin salir de la maquina.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (el modelo es exclusivamente de texto).

## Casos de uso

- Reproduccion de bugs reportados en concursos de auditoria: dado el informe de un hallazgo de Code4rena o Sherlock y el repositorio del proyecto, el modelo redacta un borrador de test Foundry que intenta reproducir la vulnerabilidad, que el auditor revisa y completa.
- Triaje de hallazgos en bug bounties: el investigador describe el fallo y obtiene un esqueleto de PoC que acelera la validacion manual antes de enviar el reporte a la plataforma.
- Formacion de auditores: el modelo sirve como generador de ejemplos de tests de vulnerabilidades conocidas en un entorno controlado, siempre con revision humana del resultado.
- Verificacion interna de parches: tras corregir una vulnerabilidad, el equipo puede pedir al modelo un test que reproduzca el comportamiento vulnerable original para comprobar que el parche lo bloquea.
- Automatizacion parcial de pipelines de auditoria: el modelo puede invocarse desde scripts que escriben el borrador en `test/PoC_N.t.sol` y ejecutan `forge test`, dejando la validacion final al revisor.
- Trabajo con codigo confidencial: al ejecutarse con Ollama en local, permite generar borradores sobre repositorios privados sin enviar el codigo a APIs externas.
- Analisis de DeFi y EVM: el ajuste esta orientado a contratos de finanzas descentralizadas y a la maquina virtual de Ethereum, lo que lo hace adecuado para proyectos de ese ecosistema con tests en Foundry.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre 37 bugs de 15 proyectos no vistos durante el entrenamiento, con validacion manual de cada test que compila y pasa:

| Modelo | Bugs demostrados | Progreso medio (0-5) | Errores de compilacion |
|---|---|---|---|
| Qwen2.5-Coder-7B (base) | 0 | 0,95 | 11 |
| poc-coder-7b-v1 | 0 | 0,78 | 18 |

El autor indica que una version anterior de la model card reportaba "1 de 22 demostrados" sobre un conjunto de prueba mas antiguo y pequeno, pero que esa prueba no supero la revision manual en el conjunto actual, por lo que se reporta 0. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud para un modelo de 7.615.616.512 parametros, una cuantizacion de 4 bits requiere del orden de 4-5 GB de VRAM y una de 8 bits en torno a 8 GB, sin contar el contexto; estas cifras son estimaciones genericas y no estan confirmadas por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si en GPUs con 8 GB o mas de VRAM en cuantizacion reducida, aunque el autor no lo especifica.
- Opciones de despliegue: Ollama es el metodo documentado por el autor (con `Modelfile` incluido en el repositorio); el repositorio incluye GGUF, por lo que llama.cpp es compatible. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| poc-coder-7b-v1 | 7.615.616.512 | no disponible | PoC en Foundry para Solidity | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen2.5-Coder-7B-Instruct (base) | 7.615.616.512 | no disponible en esta ficha | Codigo general | Apache 2.0 | Hugging Face |
| edoggy/poc-qwen2.5-coder-7b-v6 | no disponible | no disponible | PoC en Foundry (version posterior del mismo autor) | no disponible | Hugging Face |
| edoggy/audit-qwen2.5-coder-7b-v1 | no disponible | no disponible | Auditoria de contratos (mismo autor) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables de los modelos de la tabla distintos del base y de v1 en el conjunto de evaluacion del autor. No se identifican en la informacion disponible otros modelos publicos especializados en generacion de PoCs de Foundry para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo funciona con proyectos Foundry; no soporta Hardhat, Truffle ni otros frameworks de testing.
- No descubre vulnerabilidades: solo intenta demostrar bugs que el usuario le describe.
- En la evaluacion del autor no demostro ningun bug de 37 (0 validados manualmente), con progreso medio de 0,78 sobre 5.
- Genera mas errores de compilacion que su modelo base (18 frente a 11 en el conjunto de prueba), por lo que requiere iteracion y correccion manual.
- Los tests producidos son borradores: hay que revisarlos, completarlos y verificarlos a mano antes de cualquier uso.
- Riesgo de alucinacion en APIs de Foundry, nombres de funciones y supuestos sobre el contrato auditado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no documentadas en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen2.5-Coder-7B-Instruct y las normas de la plataforma de bug bounty sobre trabajo asistido por IA.
- El autor advierte de que hay que comprobar las reglas de la plataforma de bounties respecto al uso de IA en los envios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edoggy/poc-coder-7b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Version de auditoria del mismo autor: https://huggingface.co/edoggy/audit-qwen2.5-coder-7b-v1
- Version posterior del mismo autor: https://huggingface.co/edoggy/poc-qwen2.5-coder-7b-v6
- Ollama: https://ollama.com/download
- Foundry: https://getfoundry.sh
- Code4rena (origen de los datos de entrenamiento): https://code4rena.com
- Sherlock (origen de los datos de entrenamiento): https://www.sherlock.xyz
