# bobbydeveloper2014/mamba-siso-175m-nimq

## Resumen

Mamba-3 SISO 187M (publicado bajo el slug `mamba-siso-175m-nimq`) es un checkpoint cuantizado del modelo `state-spaces/mamba3-siso-187m`, empaquetado en el formato propietario NIMQ del framework Nimformers. Lo distribuye el usuario `bobbydeveloper2014` a través de Hugging Face y esta pensado para ejecutarse exclusivamente con el CLI de inferencia de Nimformers Framework, no con las herramientas habituales del ecosistema (transformers, llama.cpp, vLLM).

El modelo base es un Mamba-3 de tipo SISO (single-input single-output) con 12 capas, dimension oculta de 768, 24 cabezas y un estado de 128, lo que lo situa en la categoria de modelos pequenos orientados a generacion de texto. Sobre esos pesos se aplica un fine-tune LoRA/Linear++ de 11 bloques `R` (bloques Mamba-3 preentrenados) mas una rama `G` con compuerta Linear++ en la capa final.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general listo para produccion, sino un artefacto experimental ligado a un framework concreto. La ficha se limita a documentar lo que el autor declara; no hay informacion publica sobre datos de entrenamiento, evaluaciones ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-3 SISO (state space model), 12 capas, hidden 768, 24 cabezas, estado 128 |
| Parametros totales | 187M (el slug del repo indica 175M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4-KM (base), NIMBIN4 (checkpoint LoRA) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.nimq` (NIMQ, formato propietario de Nimformers) + `lora.bin` |

## Arquitectura y entrenamiento

La arquitectura es un state space model de la familia Mamba, en su variante Mamba-3 y con configuracion SISO. Segun la model card, consta de 12 capas con dimension oculta 768, 24 cabezas y un tamano de estado de 128. Los pesos base estan cuantizados en FP4-KM, un esquema de cuantizacion a 4 bits propio del formato NIMQ.

El checkpoint incluye ademas un fine-tune LoRA/Linear++ compuesto por 11 bloques `R` (que corresponden a bloques Mamba-3 preentrenados) y una rama `G` con compuerta Linear++ aplicada en la capa final. El adaptador se almacena en formato NIMBIN4. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones adicionales mas alla de la propia arquitectura Mamba-3 y la rama Linear++.

## Capacidades

- Generacion de texto autoregresiva, segun el `pipeline_tag` declarado (`text-generation`).
- Razonamiento y codigo: no hay evidencia documentada en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Ejecucion: unicamente a traves del CLI de inferencia de Nimformers Framework, con el checkpoint `lora.bin`.

## Casos de uso

- Experimentacion con arquitecturas SSM: el modelo permite probar inferencia Mamba-3 en local dentro del framework Nimformers, util para investigadores que quieran comparar SSM frente a transformers en tareas de generacion corta.
- Evaluacion de esquemas de cuantizacion a 4 bits: al usar FP4-KM en los pesos base y NIMBIN4 en el adaptador, sirve para medir el impacto de la cuantizacion agresiva en un modelo de 187M.
- Pruebas de fine-tuning con LoRA/Linear++: la inclusion de la rama `G` con compuerta en la capa final lo convierte en un banco de pruebas para estudiar adaptadores de bajo rango sobre SSM.
- Desarrollo y validacion del propio framework Nimformers: el repo esta estructurado como fixture de test (`test/mamba3/models`), por lo que su uso principal es la validacion de la toolchain de descarga e inferencia.
- Prototipado de generacion de texto en entornos con recursos muy limitados: con 187M parametros y cuantizacion a 4 bits, el footprint es reducido, adecuado para maquinas sin GPU dedicada.
- Docencia y demos de modelos de estado: util para ilustrar el funcionamiento interno de un SSM con estado 128 y 12 capas en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 187M en FP4 ocupa del orden de 0,1 GB de pesos, pero el runtime de Nimformers puede anadir overhead no documentado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano, aunque no hay confirmacion del autor ni requisitos publicados.
- Opciones de despliegue: exclusivamente Nimformers Framework (`make -f test/mamba3/Makefile infer`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| mamba-siso-175m-nimq (este) | 187M | no disponible | no disponible | NIMQ, solo Nimformers |
| state-spaces/mamba3-siso-187m | 187M | no disponible | no disponible | pesos upstream, ecosistema estandar |
| Modelos transformer pequenos (~125-200M, p. ej. GPT-2 small / SmolLM) | 124M-135M | 1k-2k tokens (tipico) | variable (MIT, Apache-2.0) | safetensors, GGUF, amplio soporte |

La comparacion directa con alternativas transformer es dificil porque no hay datos de rendimiento publicados para este checkpoint. La diferencia practica mas relevante no es de calidad sino de ecosistema: los modelos transformer pequenos se despliegan con herramientas estandar, mientras que este requiere Nimformers.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks, por lo que no se puede estimar su calidad frente a alternativas.
- Licencia no especificada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Formato propietario: los pesos `.nimq` y `lora.bin` no son compatibles con transformers, llama.cpp ni vLLM, lo que limita la portabilidad y la inspeccion.
- Idiomas no declarados: no hay garantia de comportamiento en castellano ni en ningun otro idioma concreto.
- Contexto desconocido: se desconoce la ventana maxima, lo que impide planificar casos de uso con entradas largas.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano; sin datos de alineacion no se puede acotar.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento no es posible evaluar sesgos de genero, raza o idioma.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de mantenimiento.
- Dependencia de un framework externo: la ruta de inferencia documentada asume una estructura de directorios concreta (`test/mamba3/models`) dentro del repo de Nimformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bobbydeveloper2014/mamba-siso-175m-nimq
- Modelo upstream: https://huggingface.co/state-spaces/mamba3-siso-187m
- Framework Nimformers: https://github.com/bobbyshop-vui/nimformers-framework
