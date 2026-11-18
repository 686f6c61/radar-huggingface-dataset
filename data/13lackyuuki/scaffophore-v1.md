# 13lackyuuki/Scaffophore-V1

## Resumen

Scaffophore-V1 es un modelo generativo condicional de fragmentos moleculares orientado al diseno de farmacos basado en fragmentos (FBDD) y a la tecnica de scaffold hopping. Lo desarrolla el usuario 13lackyuuki y se distribuye en Hugging Face bajo licencia MIT. El modelo no es un LLM de proposito general: es un generador de fragmentos quimicos que, dado un contexto (presumiblemente un scaffold o farmacoforo), produce fragmentos moleculares en representacion SELFIES, con un vocabulario de solo 33 tokens y una longitud maxima de 48 tokens por fragmento.

La relevancia practica esta en que aborda una tarea muy concreta de quimica computacional: proponer fragmentos quimicamente validos y drug-like que sustituyan o completen un scaffold existente sin romper las restricciones de diseno. El modelo se ha entrenado sobre ChEMBL completo (2.379.454 moleculas parentales) y un subconjunto drug-like de ZINC20 con peso molecular maximo de 550 Da y fragmentos de hasta 18 atomos pesados. El repositorio ocupa 0,2 GB y los pesos se publican en formato safetensors, con dos escalas documentadas: `lite` y `standard`.

La model card es escasa en detalles arquitectonicos mas alla de los hiperparametros de las dos variantes y de las metricas de test de la variante `standard` (NLL 0,8131, perplejidad 2,2550, precision de token 0,7039). No se documentan idiomas, pipeline ni resultados de benchmarks mas alla de las metricas de lenguaje autoregresivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer condicional con adaptador (width, n_layers, n_heads, ff_width, adapter_width documentados por escala) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; max_selfies_tokens = 48 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio quimico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe dos escalas con hiperparametros explicitos: `lite` (width=256, n_layers=4, n_heads=4, ff_width=1024, adapter_width=16) y `standard` (width=512, n_layers=6, n_heads=8, ff_width=2048, adapter_width=32). La presencia de un `adapter_width` sugiere un mecanismo de condicionamiento ligero (tipo adaptador) sobre un transformer autoregresivo que genera secuencias SELFIES token a token. El vocabulario es de 33 tokens y la longitud maxima de secuencia es de 48 tokens SELFIES, lo que acota estrictamente el espacio de generacion a fragmentos pequenos (hasta 18 atomos pesados).

El entrenamiento usa ChEMBL completo como fuente principal (2.379.454 moleculas parentales) y declara ZINC20 drug-like como fuente secundaria, aunque el manifiesto indica `zinc_parents: 0`, es decir, no se incorporaron finalmente parentales de ZINC20. El total de ejemplos es 3.340.294, con splits de 2.677.924 (train), 337.598 (val) y 324.772 (test). Se reportan 625.474 fallos de reconstruccion, un dato relevante sobre la calidad del pipeline de tokenizacion SELFIES. El filtro de drug-likeness aplicado es MW <= 550 y fragmentos de hasta 18 atomos pesados. No se documenta uso de RLHF, DPO ni preferencias humanas; el objetivo es puramente de modelado de lenguaje sobre SELFIES.

## Capacidades

- Generacion condicional de fragmentos moleculares en representacion SELFIES, orientada a FBDD y scaffold hopping.
- Generacion de fragmentos drug-like restringidos a MW <= 550 y hasta 18 atomos pesados.
- Modelado autoregresivo de secuencias SELFIES con vocabulario de 33 tokens.
- Condicionamiento mediante adaptador (adapter_width configurable) sobre el contexto de generacion.
- Dos escalas de capacidad/rendimiento (`lite` y `standard`) para distintos presupuestos de computo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues.

## Casos de uso

- Scaffold hopping en descubrimiento temprano: dado un scaffold o farmacoforo conocido, el modelo propone fragmentos alternativos que preservan el contexto quimico y permiten explorar espacio quimico cercano sin salir del rango drug-like (MW <= 550).
- Enriquecimiento de librerias de fragmentos: generar fragmentos SELFIES validos para ampliar una libreria interna de cribado antes de sintesis, filtrando despues por criterios fisicoquimicos.
- Diseno de linkers y sustituyentes: completar posiciones de un scaffold con fragmentos de hasta 18 atomos pesados, util en pipelines de fragment merging y fragment growing.
- Priorizacion computacional en FBDD: usar la perplejidad y la probabilidad del modelo como señal de "quimicidad" para descartar fragmentos poco plausibles antes de docking o evaluacion ADMET.
- Generacion de hipotesis en quimica medicinal: producir series de fragmentos alternativos para un mismo contexto y someterlos a revision por quimicos antes de sintesis.
- Filtrado y aumentacion de datasets quimicos: generar variantes SELFIES de fragmentos existentes para aumentar datos de entrenamiento de modelos downstream (propiedad, retrosintesis, docking).
- Prototipado rapido en entornos con pocos recursos: la variante `lite` (width=256, 4 capas, repo de 0,2 GB) permite iterar en una sola GPU consumer para experimentos exploratorios.

## Benchmarks y rendimiento

| Modelo | Escala | Test NLL | Test perplexity | Test token accuracy |
|---|---|---:|---:|---:|
| Scaffophore-V1 | `lite` | 0,0000 | 0,0000 | 0,0000 |
| Scaffophore-V1 | `standard` | 0,8131 | 2,2550 | 0,7039 |

Los valores de la escala `lite` aparecen a cero en la model card, lo que sugiere que no se evaluaron o que la metrica no se reporto correctamente; no deben interpretarse como rendimiento perfecto. No se han publicado comparaciones con otros modelos de generacion de fragmentos (por ejemplo, variantes de JT-VAE, GraphAF o modelos SELFIES de referencia) en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 0,2 GB, por lo que ambos checkpoints caben holgadamente en VRAM de cualquier GPU moderna.
- La variante `lite` (width=256, 4 capas) es adecuada para GPU consumer (RTX 3060/4060 en adelante) e incluso para inferencia en CPU para lotes pequenos.
- La variante `standard` (width=512, 6 capas) requiere muy poca VRAM adicional y se ejecuta sin problema en RTX 4090, A100 o H100, aunque no se beneficia de ellas por el tamano reducido.
- Despliegue: al publicarse en safetensors y con `library_name: safetensors`, requiere cargar los pesos con la implementacion del autor; no se documenta soporte nativo en vLLM, TGI, llama.cpp ni Ollama (son entornos orientados a LLM, no a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scaffophore-V1 | no disponible | 48 tokens SELFIES | Generacion condicional de fragmentos | MIT | Hugging Face |
| Alternativas de generacion de fragmentos (JT-VAE, GraphAF, modelos SELFIES) | no disponible | no disponible | Generacion de moleculas/fragmentos | variable | no disponible en esta busqueda |

No se dispone de datos comparativos de rendimiento con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos; al entrenarse sobre ChEMBL, hereda el sesgo de cobertura de ese corpus (sobrerrepresentacion de quimica patentada y de ciertos targets).
- Riesgo de generar fragmentos quimicamente invalidos: se reportan 625.474 fallos de reconstruccion en el pipeline de datos, lo que indica que una fraccion no trivial de las representaciones SELFIES no se reconstruye correctamente.
- El modelo esta restringido a fragmentos de hasta 18 atomos pesados y moleculas de MW <= 550; no es adecuado para moleculas grandes ni para proteinas.
- No es un LLM: no procesa lenguaje natural, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- La variante `lite` reporta metricas a cero, lo que impide validar su calidad a partir de la model card.
- Aunque la licencia es MIT, el uso comercial en descubrimiento de farmacos debe considerar las obligaciones de atribucion de ChEMBL (licencia CC BY-SA de la base de datos original) y las patentes de las moleculas de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; no hay evidencia de validacion externa ni de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/13lackyuuki/Scaffophore-V1
- ChEMBL: https://www.ebi.ac.uk/chembl/
- ZINC20: https://zinc20.docking.org/
- SELFIES (representacion molecular): https://github.com/aspuru-guzik-group/selfies
