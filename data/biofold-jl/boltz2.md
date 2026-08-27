# biofold-jl/boltz2

## Resumen

Boltz-2 es un modelo fundacional biomolecular desarrollado por el MIT Jameel Clinic for Machine Learning in Health, diseñado para la predicción conjunta de estructuras tridimensionales de complejos biomoleculares y su afinidad de unión. Este modelo representa una evolución significativa respecto a AlphaFold3 y Boltz-1, ya que no solo predice la geometría de complejos proteína-ligando, ácidos nucleicos y otras biomoléculas, sino que también estima la fuerza de interacción entre ellas, un componente crítico para el diseño molecular racional.

La relevancia de Boltz-2 radica en que es el primer modelo de deep learning que se acerca a la precisión de los métodos de perturbación de energía libre (FEP) basados en física, pero ejecutándose aproximadamente 1000 veces más rápido. Esto democratiza el cribado in silico de fármacos, permitiendo a laboratorios académicos y pequeñas empresas de biotecnología realizar estudios de afinidad que antes requerían infraestructura computacional masiva. El modelo se distribuye bajo licencia MIT, lo que facilita su adopción comercial sin restricciones.

El repositorio `biofold-jl/boltz2` en HuggingFace contiene los pesos originales de Boltz-2 convertidos al formato `.safetensors`, con un tamaño de 4.2 GB. Esta conversión facilita la integración con herramientas modernas de inferencia y despliegue que priorizan la seguridad y eficiencia de este formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna de Boltz-2 no se detalla en la informacion proporcionada, pero se sabe que es un modelo de deep learning especificamente disenado para co-folding biomolecular, es decir, la prediccion simultanea de la estructura de multiples moleculas que interactuan. A diferencia de los modelos de lenguaje, Boltz-2 opera sobre secuencias de aminoacidos, nucleotidos y representaciones de ligandos quimicos, generando coordenadas 3D y metricas de confianza asociadas.

El entrenamiento de Boltz-2 se realizo con datos estructurales publicos y probablemente incluyo tecnicas de aprendizaje autosupervisado sobre grandes corpus de estructuras conocidas, aunque los detalles especificos sobre el numero de tokens, composicion del dataset o uso de RLHF/DPO no estan disponibles en la informacion recopilada. La innovacion principal del modelo es su capacidad para predecir afinidades de union con precision comparable a metodos fisicos, lo que sugiere una arquitectura que integra informacion estructural y energetica de forma conjunta.

## Capacidades

- Prediccion de estructuras 3D de complejos biomoleculares, incluyendo proteinas, acidos nucleicos y ligandos de moleculas pequenas.
- Estimacion de afinidad de union por complejo, con salida binaria de probabilidad de union y un valor continuo tipo IC50.
- Generacion de metricas de confianza por complejo y por cadena: pLDDT, pTM, ipTM, PAE y PDE.
- Opcionalmente, devuelve embeddings de secuencia unicos y por pares, utiles para tareas downstream de aprendizaje automatico.
- Capacidad de co-folding, es decir, modelar simultaneamente multiples cadenas que interactuan en un complejo.
- No es un modelo de lenguaje: no genera texto, codigo ni soporta tool calling.

## Casos de uso

- Cribado virtual de farmacos: Boltz-2 puede evaluar rapidamente la afinidad de union de miles de candidatos a un objetivo proteico, priorizando compuestos para validacion experimental. Su velocidad (1000x mas rapido que FEP) permite cubrir bibliotecas quimicas extensas en horas.
- Diseño racional de proteinas: los investigadores pueden mutar residuos especificos y predecir como afectan a la estructura y afinidad de union, guiando la evolucion dirigida de enzimas o anticuerpos.
- Estudio de interacciones proteina-proteina: el modelo predice complejos entre proteinas, lo que es util para mapear redes de interaccion y comprender mecanismos de señalizacion celular.
- Prediccion de union proteina-ARN: Boltz-2 puede modelar complejos de ribonucleoproteinas, relevante para el estudio de regulacion post-transcripcional y diseño de terapias basadas en ARN.
- Desarrollo de biosensores: al predecir la afinidad entre una proteina de diseno y un analito, se pueden optimizar componentes de biosensores para diagnostico clinico o monitorizacion ambiental.
- Validacion de dianas terapeuticas: antes de invertir en un programa de descubrimiento de farmacos, las empresas pueden usar Boltz-2 para confirmar que una proteina candidata es "druggable", es decir, que presenta sitios de union viables para moleculas pequenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion oficial indica que Boltz-2 se acerca a la precision de los metodos FEP basados en fisica, pero no se proporcionan cifras concretas de MMLU, HumanEval u otros benchmarks estandar, ya que este modelo no pertenece a la categoria de modelos de lenguaje.

## Requisitos de hardware

- El repositorio pesa 4.2 GB en formato safetensors, lo que sugiere que el modelo puede cargarse en GPUs con al menos 8-12 GB de VRAM, dependiendo de la precision de inferencia.
- Se recomienda una GPU NVIDIA con soporte CUDA para un rendimiento optimo; modelos como RTX 3090, RTX 4090, A100 o H100 son adecuados.
- Dado que es un modelo biomolecular, no se puede ejecutar en CPU de forma practica para tareas de produccion; se requiere aceleracion por GPU.
- Las opciones de despliegue tipicas incluyen el uso del repositorio oficial de Boltz en GitHub, que proporciona scripts de inferencia, o la integracion en pipelines personalizados con PyTorch.
- No se dispone de datos sobre latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Afinidad de union | Licencia | Disponibilidad |
|---|---|---|---|---|
| Boltz-2 | Biomolecular foundation model | Si | MIT | Abierto |
| AlphaFold3 | Biomolecular structure prediction | No (solo estructura) | Uso no comercial | Restringido |
| Boltz-1 | Biomolecular structure prediction | No | MIT | Abierto |

Boltz-2 se diferencia de AlphaFold3 principalmente en dos aspectos: predice afinidad de union (no solo estructura) y se distribuye bajo licencia MIT, permitiendo uso comercial sin restricciones. Frente a Boltz-1, su predecesor, anade la capacidad de modelar afinidades y mejora la precision general.

## Limitaciones y advertencias

- La informacion disponible no detalla sesgos especificos, pero como todo modelo entrenado con datos publicos, puede presentar sesgos hacia proteinas bien representadas en el Protein Data Bank.
- Existe riesgo de alucinacion estructural: el modelo puede generar conformaciones plausibles pero incorrectas, especialmente para complejos poco representados en el entrenamiento.
- La prediccion de afinidad es una estimacion computacional; los valores IC50 predichos deben validarse experimentalmente antes de tomar decisiones criticas.
- Aunque la licencia MIT permite uso comercial, los datos de entrenamiento pueden tener restricciones de origen que el usuario debe verificar.
- El modelo no es un modelo de lenguaje y no debe usarse para tareas de procesamiento de texto o generacion de codigo.
- No se proporcionan detalles sobre la longitud maxima de secuencia soportada, lo que podria limitar su aplicacion a proteinas muy grandes o complejos extensos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/biofold-jl/boltz2
- Sitio oficial de Boltz-2: https://boltz.bio/boltz2
- Ficha en biolm.ai: https://biolm.ai/models/boltz2/
- Repositorio oficial en GitHub: https://github.com/jwohlwend/boltz
- Repositorio alternativo en GitHub: https://github.com/brisingr10/boltz2
- Articulo sobre el lanzamiento: https://journals.sagepub.com/doi/10.1089/genedge.7.1.071
