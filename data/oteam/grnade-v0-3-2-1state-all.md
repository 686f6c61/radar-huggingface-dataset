# oteam/grnade-v0.3.2-1state-all

## Resumen

gRNAde es un modelo de aprendizaje profundo geometrico disenado para el diseno inverso de secuencias de ARN (RNA inverse folding): dado un esqueleto tridimensional de ARN, predice la secuencia de nucleotidos que adoptaria esa estructura. Este checkpoint concreto, `oteam/grnade-v0.3.2-1state-all`, es una implementacion no oficial publicada por el equipo OFoldX dentro de su libreria `ofoldx`, basada en el trabajo original de Chaitanya K. Joshi y colaboradores (paper arXiv:2305.14749 y su extension en bioRxiv de 2025). No es un modelo de lenguaje: es un modelo biologico estructural con 2.157.052 parametros, orientado a un pipeline de diseno molecular.

La arquitectura combina un codificador basado en geometric-vector perceptron (GVP) con un decodificador autorregresivo de nucleotidos. La variante v0.3.2 utiliza un grafo espacial puro, sin canales de secuencia ni de pares de bases, y este checkpoint esta configurado para una unica conformacion de entrada ("1state"). Frente a la variante v1, que incorpora orden de secuencia y pares de estructura secundaria explicitos, la v0.3.2 se apoya unicamente en la geometria espacial.

Su relevancia actual reside en que el diseno de ARN con propiedades estructurales controladas es un problema central en biologia sintetica, desarrollo de aptameros y terapias de ARN. gRNAde aborda este problema con un enfoque geometrico que generaliza a multiples conformaciones, y este checkpoint permite ejecutarlo directamente a traves de la libreria `ofoldx` sin necesidad de reproducir el pipeline de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador GVP (geometric-vector perceptron) de 4 bloques + decodificador autorregresivo de 4 bloques |
| Parametros totales | 2.157.052 (2.157 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; la entrada es una estructura 3D de ARN) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Dimension nodo escalar / vectorial | 128 / 16 |
| Dimension arista escalar / vectorial | 64 / 4 |
| Canales de arista de entrada | 131 |
| Conformaciones soportadas | 1 (variante 1state) |
| Libreria | ofoldx |

## Arquitectura y entrenamiento

El modelo sigue un esquema de diseno inverso de ARN: un codificador geometrico procesa el grafo de la estructura tridimensional y un decodificador autorregresivo genera la secuencia de nucleotidos posicion a posicion. El codificador emplea bloques GVP, una primitiva de aprendizaje profundo geometrico que respeta la equivarianza rotacional y traslacional sobre las coordenadas atomicas. La variante v0.3.2 emplea un grafo construido solo con caracteristicas espaciales (131 canales de arista), a diferencia de la v1, que anade orden de secuencia y pares de base de la estructura secundaria (132 canales). Ambas variantes comparten el mismo numero de parametros: 2.157 M.

El entrenamiento se plantea como recuperacion autorregresiva de identidades de nucleotidos condicionada por el contexto estructural, con un valor de label smoothing de 0,05. La model card no detalla el corpus de entrenamiento ni el numero de tokens o estructuras utilizadas, y remite a los papers originales para la construccion de los ejemplos de una y multiples conformaciones. Este checkpoint concreto conserva la configuracion de una sola conformacion liberada por el autor original. OFoldX expone un `forward` con teacher forcing diferenciable y una `GrnadeLoss` para entrenamiento y ajuste fino, pero la orquestacion completa del entrenamiento (construccion de dataset, cribado, seguimiento de experimentos) queda fuera del alcance de la libreria.

## Capacidades

- Diseno inverso de secuencias de ARN a partir de una estructura tridimensional de esqueleto.
- Prediccion autorregresiva de nucleotidos con control de temperatura de muestreo y generacion de multiples candidatos (`num_candidates`).
- Condicionamiento por estructura secundaria explicita mediante cadena dot-bracket.
- Soporte de multiples instancias de ARN dentro de una misma estructura mediante `instance_id`.
- Puntuacion de las secuencias candidatas generadas (design record y sequence scores).
- Capacidad de condicionar el diseno en varias conformaciones alineadas en las variantes multiestado (esta variante concreta esta limitada a una).
- Exposicion de `forward` diferenciable y funcion de perdida para ajuste fino.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni generacion de texto libre.

## Casos de uso

- Diseno de aptameros de ARN: dado un esqueleto estructural de un aptamero con bolsillo de union a ligando, el modelo genera secuencias candidatas compatibles con esa geometria, que despues se filtran y validan experimentalmente.
- Optimizacion de ribozimas: se parte de la estructura cristalografica o modelada de una ribozima y se proponen variantes de secuencia que preservan el plegamiento catalitico.
- Diseno de ARN para terapias de ARN mensajero: la generacion de multiples candidatos con temperatura controlada permite explorar el espacio de secuencias que adoptan una estructura secundaria y terciaria diana.
- Ingenieria de elementos estructurales de ARN no codificante: el modelo permite redisenar regiones de un ARN no codificante manteniendo su arquitectura tridimensional, util en estudios de funcion estructural.
- Ajuste fino sobre datos propios: al exponer `GrnadeLoss` y un `forward` diferenciable, el checkpoint sirve como inicializacion para reentrenar sobre un corpus estructural especifico de un laboratorio.
- Cribado computacional previo a sintesis: generar y puntuar candidatos in silico reduce el numero de secuencias que se sintetizan y ensayan en el laboratorio.
- Diseno condicionado por estructura secundaria conocida: la entrada dot-bracket permite fijar el apareamiento de bases esperado y generar secuencias coherentes con el.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 2,157 M de parametros, el peso en precision completa (fp32) seria de aproximadamente 8,6 MB, por lo que la huella de memoria del modelo es marginal frente a la de los tensores de la estructura de entrada.
- GPU recomendadas: no disponible. Por el tamano del modelo, cualquier GPU con soporte CUDA deberia poder ejecutarlo; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: previsiblemente si, dado el reducido numero de parametros, aunque la model card no lo confirma ni indica modelos concretos.
- Opciones de despliegue: la unica via documentada es la libreria `ofoldx` (`pip install ofoldx`) mediante `ofoldx.pipeline("design", ...)`, con ejecucion por etapas (`prepare`, `forward`, `postprocess`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Conformaciones | Grafo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gRNAde v0.3.2 1state (este checkpoint) | 2,157 M | 1 | Espacial (131 canales) | AGPL-3.0 | Hugging Face (oteam) |
| gRNAde v0.3.2 2state / 3state / 5state | 2,157 M (segun especificacion v0.3.2) | 2, 3 y 5 | Espacial | AGPL-3.0 | Hugging Face (oteam) |
| gRNAde v1 | 2,157 M | 1 (variante base) | Secuencia + pares de base + espacial (132 canales) | AGPL-3.0 | Hugging Face (oteam/grnade) |
| gRNAde ODesign | no disponible | no disponible | no disponible | no disponible | Hugging Face (oteam/grnade-odesign) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: la model card la describe explicitamente como una reproduccion no oficial del trabajo original; el equipo de gRNAde no la ha validado ni escrito su model card.
- Limitada a una unica conformacion: esta variante no puede condicionarse en multiples estados estructurales, a diferencia de las variantes 2state, 3state y 5state.
- Grafo espacial sin canales de secuencia ni pares de base: la v0.3.2 omite informacion de orden de secuencia y de estructura secundaria explicita que si usa la v1, lo que puede afectar al rendimiento en ciertos casos.
- Dependencia de la libreria `ofoldx`: no es ejecutable con frameworks estandar de Hugging Face Transformers; requiere la libreria propia del autor del checkpoint.
- Sin resultados de benchmarks publicados en la informacion disponible: no es posible evaluar su calidad frente a alternativas sin consultar los papers originales.
- Riesgo de predicciones biologicamente invalidas: como todo modelo de diseno inverso, las secuencias generadas son hipotesis computacionales que requieren validacion experimental.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial o la integracion en servicios en red requiere revisar el cumplimiento de la licencia.
- Sin informacion sobre sesgos ni limitaciones de idioma (no aplica al no ser un modelo linguistico).
- Sin datos de cuantizacion ni de formatos alternativos de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/grnade-v0.3.2-1state-all
- Variante v1: https://huggingface.co/oteam/grnade
- Checkpoint ODesign: https://huggingface.co/oteam/grnade-odesign
- Variante 1state das: https://huggingface.co/oteam/grnade-v0.3.2-1state-das
- Variante 1state multi: https://huggingface.co/oteam/grnade-v0.3.2-1state-multi
- Variante 2state all: https://huggingface.co/oteam/grnade-v0.3.2-2state-all
- Variante 3state all: https://huggingface.co/oteam/grnade-v0.3.2-3state-all
- Variante 3state das: https://huggingface.co/oteam/grnade-v0.3.2-3state-das
- Variante 3state multi: https://huggingface.co/oteam/grnade-v0.3.2-3state-multi
- Variante 5state all: https://huggingface.co/oteam/grnade-v0.3.2-5state-all
- Variante 5state das: https://huggingface.co/oteam/grnade-v0.3.2-5state-das
- Variante 5state multi: https://huggingface.co/oteam/grnade-v0.3.2-5state-multi
- Paper original: https://arxiv.org/abs/2305.14749
- Paper de 2025: https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Codigo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Guia de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Repositorio oficial: https://github.com/chaitjo/geometric-rna-design
- Documentacion de ofoldx: https://ofoldx.valtech.ai/
