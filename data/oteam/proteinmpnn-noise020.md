# oteam/proteinmpnn-noise020

## Resumen

ProteinMPNN es un modelo de diseño inverso de secuencias proteicas (*inverse folding*): dado un esqueleto proteico fijo (coordenadas de los atomos de la cadena principal), genera secuencias de aminoacidos compatibles con esa geometria. Este checkpoint concreto, `oteam/proteinmpnn-noise020`, es una implementacion no oficial del modelo original publicado por Dauparas et al. en *Science* (2022), empaquetada por el equipo OFoldX dentro de su libreria `ofoldx`. El sufijo `noise020` indica que el modelo fue entrenado con perturbaciones de coordenadas de 0.20 A, una de las cuatro variantes de ruido que ofrece la familia (0.02, 0.10, 0.20 y 0.30 A).

Arquitectonicamente no es un transformer de lenguaje: es una red neuronal de paso de mensajes (*message passing*) sobre un grafo de vecinos espaciales de residuos, con un codificador de 3 bloques y un decodificador de 3 bloques, tamano oculto de 128 y 48 vecinos por nodo. Con 1.674 millones de parametros, es un modelo muy compacto que se ejecuta en CPU sin problemas y en cualquier GPU consumer. La generacion es autorregresiva, decodificando residuos en un orden causal muestreado.

Su relevancia practica esta en el pipeline de diseno de proteinas: ProteinMPNN es el estandar de facto para generar secuencias que plieguen sobre una estructura dada, y se usa habitualmente junto a predictores como AlphaFold o ESMFold para ciclos de diseno-generacion-validacion. La variante con ruido 0.20 A esta pensada para escenarios donde el esqueleto de entrada tiene incertidumbre geometrica moderada (por ejemplo, estructuras predichas o modelos de baja resolucion), lo que la hace mas robusta que la variante de ruido minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de paso de mensajes (MPNN) autorregresiva sobre grafo k-NN de residuos; 3 bloques de codificador y 3 de decodificador |
| Parametros totales | 1.673.592 (~1.674 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; opera sobre el numero de residuos del esqueleto de entrada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el modelo es lo bastante pequeno para ejecutarse en precision completa) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; su "alfabeto" son los 20 aminoacidos estandar) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ProteinMPNN representa cada residuo como un nodo en un grafo de vecinos espaciales mas cercanos (48 vecinos por defecto). Las caracteristicas de entrada son las coordenadas de los atomos de la cadena principal (N, CA, C, O en la variante estandar), codificadas mediante distancias y orientaciones relativas entre residuos vecinos. El codificador aplica bloques de paso de mensajes con actualizaciones de aristas y nodos, y el decodificador genera la secuencia de aminoacidos de forma autorregresiva en un orden causal muestreado, lo que permite condicionar cada posicion a las ya decodificadas. Esta formulacion soporta restricciones como posiciones fijas, identidades ligadas, aminoacidos permitidos por posicion y perfiles de secuencia.

El entrenamiento sigue el esquema del trabajo original: recuperacion de identidad de aminoacidos a partir de la geometria del esqueleto, usando ensamblados biologicos del PDB (version de 2 de agosto de 2021) con cadenas agrupadas al 30% de identidad de secuencia. La innovacion clave es la perturbacion de coordenadas durante el entrenamiento (en este checkpoint, ruido de 0.20 A), que aporta robustez frente a imprecisiones geometricas en la entrada. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, composicion detallada del dataset ni uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Diseno inverso de secuencias: genera secuencias de aminoacidos compatibles con un esqueleto proteico fijo.
- Puntuacion de secuencias: calcula la log-verosimilitud negativa (NLL) global y por residuo en nats por residuo, util para ranking de disenos.
- Decodificacion con orden causal muestreado y multiples ordenes de decodificacion para promediar puntuaciones (`num_decoding_orders`).
- Restricciones de diseno: posiciones fijas, identidades ligadas, aminoacidos permitidos por posicion y perfiles de secuencia.
- Robustez a ruido geometrico moderado (entrenado con perturbacion de 0.20 A), adecuada para esqueletos predichos o imperfectos.
- Integracion con *packing* de cadenas laterales mediante el pipeline `ProteinMpnnDesignAndPackPipeline` de OFoldX, que combina el disenador con un MPNN Packer independiente.
- No soporta tool calling, agentes, vision, audio ni generacion de texto libre; su dominio es exclusivamente estructural-proteico.

## Casos de uso

- Diseno de proteinas de novo sobre esqueletos generados: tras un generador de estructuras (por ejemplo, un modelo de difusion de backbone), ProteinMPNN asigna secuencias que plegarian sobre esa geometria; la variante noise020 tolera la imprecision tipica de esqueletos generados.
- Rediseno de secuencias manteniendo el pliegue: dado un PDB experimental, se fijan posiciones criticas (sitio activo, interfaz) y se deja libertad al resto para optimizar estabilidad o solubilidad, usando las restricciones por posicion del modelo.
- Puntuacion y ranking de candidatos: el pipeline `score` devuelve NLL por residuo, lo que permite filtrar bibliotecas de disenos y seleccionar los que mejor encajan con el esqueleto antes de pasar a validacion experimental.
- Ciclos de diseno-validacion con predictores de estructura: se generan secuencias con ProteinMPNN, se pliegan con AlphaFold/ESMFold y se mide el RMSD entre estructura predicha y esqueleto de diseno; el modelo se usa como primer paso del ciclo.
- Ingenieria de proteinas existentes: rediseno de superficies para reducir agregacion o mejorar expresabilidad, manteniendo el core estructural fijo mediante restricciones de posiciones.
- Integracion en pipelines de *design and pack*: combinado con el MPNN Packer de OFoldX para obtener coordenadas de cadenas laterales tras el diseno de secuencia, permitiendo pasar de esqueleto a modelo atomistico completo.
- Docencia y prototipado en bioinformatica estructural: al ser un modelo de 1.7 M de parametros, se ejecuta en CPU y permite experimentar con diseno inverso sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion de secuencia, *perplexity* ni comparaciones cuantitativas con otras variantes o modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (1.674 M de parametros en fp32 ocupan aproximadamente 6.7 MB; el grueso del consumo viene del grafo de vecinos y del tamano de la proteina de entrada).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; tambien funciona en CPU para proteinas de tamano moderado.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: la libreria `ofoldx` (instalable via `pip install ofoldx`) es la via oficial de este checkpoint; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del numero de residuos y del numero de ordenes de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Backbone | Ruido de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/proteinmpnn-noise020 (este) | 1.674 M | N, CA, C, O | 0.20 A | AGPL-3.0 | Hugging Face (oteam) |
| oteam/proteinmpnn-noise002 | 1.674 M | N, CA, C, O | 0.02 A | AGPL-3.0 | Hugging Face (oteam) |
| oteam/proteinmpnn-noise010 | 1.674 M | N, CA, C, O | 0.10 A | AGPL-3.0 | Hugging Face (oteam) |
| oteam/proteinmpnn-noise030 | 1.674 M | N, CA, C, O | 0.30 A | AGPL-3.0 | Hugging Face (oteam) |
| oteam/solublempnn-noise020 | 1.674 M | N, CA, C, O | 0.20 A | AGPL-3.0 | Hugging Face (oteam) |
| oteam/proteinmpnn-ca-only-noise020 | 1.642 M | CA | 0.20 A | AGPL-3.0 | Hugging Face (oteam) |

No se dispone de datos de rendimiento comparativo entre variantes en la informacion proporcionada. Las alternativas de la misma categoria (otros disenadores inversos como ESM-IF) no aparecen documentadas en la informacion disponible.

## Limitaciones y advertencias

- Implementacion no oficial: la model card indica explicitamente que el equipo original de ProteinMPNN no escribio esta tarjeta ni necesariamente respalda este checkpoint; la referencia canonica es `dauparas/ProteinMPNN`.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red puede requerir liberar el codigo derivado. Verificar con asesoria legal antes de produccion.
- Dependencia de la libreria `ofoldx`: los pesos no son directamente utilizables con frameworks genericos; requieren la libreria del autor.
- Riesgo de disenos no funcionales: el modelo optimiza compatibilidad geometrica, no estabilidad termodinamica, solubilidad ni funcion; los disenos requieren validacion experimental.
- Sensibilidad al esqueleto de entrada: la calidad del diseno depende de la calidad geometrica del backbone; la variante noise020 esta calibrada para ruido moderado, no para esqueletos muy imprecisos (para ello existe noise030).
- Sesgos del dataset: entrenado con ensamblados del PDB de 2021 agrupados al 30% de identidad; puede infrarrepresentar familias proteicas poco presentes en el PDB.
- Sin capacidades de lenguaje, vision ni agentes: no debe emplearse fuera de su dominio estructural.
- Sin datos de benchmarks publicados en la informacion disponible, por lo que no es posible comparar su rendimiento cuantitativo con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/proteinmpnn-noise020
- Variante noise002: https://huggingface.co/oteam/proteinmpnn-noise002
- Variante noise010: https://huggingface.co/oteam/proteinmpnn-noise010
- Variante noise030: https://huggingface.co/oteam/proteinmpnn-noise030
- SolubleMPNN: https://huggingface.co/oteam/solublempnn
- CA-only: https://huggingface.co/oteam/proteinmpnn-ca-only
- Checkpoint de ejemplo de entrenamiento: https://huggingface.co/oteam/proteinmpnn-training-example
- Paper original: https://doi.org/10.1126/science.add2187
- Repositorio oficial: https://github.com/dauparas/ProteinMPNN
- Codigo OFoldX (proteinmpnn): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- Guia de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Documentacion OFoldX: https://ofoldx.valtech.ai/
