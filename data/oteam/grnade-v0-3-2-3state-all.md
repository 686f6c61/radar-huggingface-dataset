# oteam/grnade-v0.3.2-3state-all

## Resumen

gRNAde es un modelo de aprendizaje profundo geométrico disenado para el diseno inverso de secuencias de ARN (RNA inverse folding): dado un esqueleto tridimensional de ARN, predice la secuencia de nucleotidos que probablemente adopte esa conformacion. Desarrollado originalmente por Chaitanya K. Joshi y colaboradores (paper arXiv:2305.14749), esta version concreta es una implementacion no oficial publicada por el equipo OFoldX bajo el identificador `oteam/grnade-v0.3.2-3state-all`.

El modelo emplea un codificador de perceptron vectorial geometrico (GVP) combinado con un decodificador autoregresivo de nucleotidos. La variante v0.3.2 utiliza un grafo puramente espacial (sin canales de secuencia ni de pares de bases) y esta configurada para condicionar el diseno sobre tres conformaciones alineadas de la misma molecula de ARN, lo que permite generar secuencias robustas frente a cambios conformacionales.

Con solo 2,157 millones de parametros, gRNAde es un modelo compacto y especializado, no un modelo de lenguaje general. Su relevancia actual reside en el diseno computacional de ARN para terapeuticas, ribozimas, aptameros y ARN sintetico, donde la estabilidad estructural frente a multiples estados conformacionales es un requisito critico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador GVP (geometric-vector perceptron) de 4 bloques + decodificador autoregresivo de nucleotidos de 4 bloques |
| Parametros totales | 2.157.052 (~2,16 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el limite lo impone el tamano de la cadena de ARN de entrada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Libreria | ofoldx |
| Pipeline | other |
| Tarea | RNA inverse folding / diseno de secuencia de ARN |
| Estados conformacionales | 3 conformaciones alineadas |
| Canales de nodo (escalar/vector) | 128 / 16 |
| Canales de arista (escalar/vector) | 64 / 4 |
| Canales de entrada de arista | 131 |
| Valor de label smoothing | 0.05 |
| Region | us |

## Arquitectura y entrenamiento

La arquitectura combina un codificador geometrico basado en GVP que procesa grafos de ARN con caracteristicas espaciales (coordenadas de fosforo, C4' y nitrogenos de base, segun la variante) y un decodificador autoregresivo que genera la secuencia de nucleotidos token a token. La variante v0.3.2 se diferencia de la v1 en que su grafo es puramente espacial: elimina los canales de arista de orden de secuencia y de pares de bases secundarias, reteniendo unicamente la geometria tridimensional. El modelo tiene 4 bloques de codificador y 4 de decodificador, con 128 dimensiones escalares y 16 vectoriales por nodo, y 64/4 por arista.

El entrenamiento se formula como recuperacion autoregresiva de identidades de nucleotidos a partir del contexto estructural, con un valor de label smoothing de 0.05. La model card remite a los papers originales para los detalles del corpus de entrenamiento y la construccion de ejemplos mono y multi-conformacionales; no se especifica en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO (no aplicable en este dominio). La innovacion principal es la capacidad de condicionar el diseno sobre multiples conformaciones alineadas de la misma secuencia de ARN, promediando la informacion estructural antes de predecir identidades.

## Capacidades

- Diseno inverso de secuencias de ARN a partir de esqueletos 3D (inverse folding).
- Condicionamiento sobre tres conformaciones alineadas de la misma molecula de ARN para disenar secuencias robustas a cambios conformacionales.
- Generacion de multiples candidatos de secuencia con control de temperatura de muestreo (parametro `temperature`).
- Puntuacion de secuencias candidatas generadas.
- Procesamiento de estructuras en formato mmCIF mediante `read_structure`.
- Soporte de estructuras con multiples instancias de ARN mediante `instance_id`.
- Entrenamiento y fine-tuning con `forward` diferenciable (teacher forcing) y la funcion de perdida `GrnadeLoss`.
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues: es un modelo biologico especializado.

## Casos de uso

- Diseno de ribozimas: dado el esqueleto cristalografico de una ribozima, generar secuencias candidatas que preserven el plegamiento catalitico y evaluarlas experimentalmente despues.
- Ingenieria de aptameros: disenar secuencias de ARN que adopten una conformacion de union a un ligando concreto, usando la estructura 3D del aptamero como objetivo.
- ARN terapeutico (siRNA, mRNA): explorar secuencias alternativas que mantengan la estructura funcional y mejoren la estabilidad frente a variaciones conformacionales, gracias al modo de tres estados.
- Diseno de switches conformacionales de ARN: aprovechar el condicionamiento multi-conformacional para generar secuencias que funcionen en los estados abierto y cerrado simultaneamente.
- Aumento de datos estructurales: generar secuencias plausibles para estructuras resueltas por criomicroscopia electronica o predicciones de AlphaFold, facilitando el analisis y la validacion.
- Filtrado y priorizacion en pipelines de diseno: puntuar candidatos generados y ordenarlos por compatibilidad estructural antes de sintesis y ensayo in vitro.
- Investigacion en biologia computacional: fine-tuning del modelo con `GrnadeLoss` sobre corpus propios de estructuras de ARN para adaptarlo a familias especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia en precision completa, dado el tamano de 2,16 M de parametros; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100); el cuello de botella es el tamano de la estructura de ARN, no el modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en CPU para estructuras pequenas.
- Opciones de despliegue: libreria `ofoldx` (instalable con `pip install ofoldx`), con pipeline `design` y ejecucion por etapas (`prepare`, `forward`, `postprocess`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Conformaciones | Grafo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gRNAde v0.3.2 3state (este) | 2,16 M | 3 | Espacial | AGPL-3.0 | HuggingFace (oteam) |
| gRNAde v1 | 2,16 M | Multiples | Secuencia + pares de bases + espacial | AGPL-3.0 | HuggingFace (oteam/grnade) |
| gRNAde v0.3.2 1state | 2,16 M | 1 | Espacial | AGPL-3.0 | HuggingFace (oteam) |
| gRNAde v0.3.2 5state | 2,16 M | 5 | Espacial | AGPL-3.0 | HuggingFace (oteam) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otros metodos de diseno inverso de ARN (por ejemplo, EternaFold o diseno basado en energia) en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: el equipo original de gRNAde no escribio esta model card ni necesariamente valido este checkpoint; para resultados de referencia debe consultarse el repositorio oficial `chaitjo/geometric-rna-design`.
- Requiere que las conformaciones alineadas contengan la misma secuencia de ARN; no admite conformaciones con secuencias distintas.
- La variante v0.3.2 usa solo geometria espacial, sin canales de secuencia ni pares de bases, lo que puede limitar la precision frente a la v1 en escenarios donde la estructura secundaria es informativa.
- El numero de conformaciones esta fijado en el checkpoint (3 en este caso); no es configurable en tiempo de inferencia.
- Riesgo de generar secuencias no funcionales o inestables: las predicciones son hipotesis computacionales que requieren validacion experimental.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red puede requerir liberar el codigo derivado. Verificar con asesoria legal antes de produccion.
- Sesgos: no documentados en la informacion disponible; el modelo puede estar sesgado hacia las familias estructurales presentes en su corpus de entrenamiento.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural ni tool calling.
- Documentacion de entrenamiento incompleta: la model card remite a los papers para el corpus y no detalla el dataset ni el procedimiento completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/grnade-v0.3.2-3state-all
- Paper original: https://arxiv.org/abs/2305.14749
- Paper reciente (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Repositorio oficial: https://github.com/chaitjo/geometric-rna-design
- Codigo de la implementacion: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Guia de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Libreria ofoldx: https://ofoldx.valtech.ai/
- Variante v1: https://huggingface.co/oteam/grnade
- Checkpoint ODesign: https://huggingface.co/oteam/grnade-odesign
