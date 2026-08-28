# Rakshit-negi/tds-carbon-card

## Resumen

Este repositorio de Hugging Face, identificado como `Rakshit-negi/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta las emisiones de CO₂ asociadas a un proceso de entrenamiento de un modelo. El autor, Rakshit Negi, lo ha publicado como parte de una asignación académica (TDS GA8) centrada en la transparencia energética y el impacto ambiental del entrenamiento de modelos.

El contenido se limita a un registro de emisiones calculado con CodeCarbon, indicando un total de 265,766 kg de CO₂ equivalente, generados durante un fine-tuning realizado en 7 GPUs NVIDIA V100 en la región europe-west4. No se proporciona información sobre la arquitectura, los parámetros, el contexto o las capacidades del modelo entrenado, ya que el propósito de este repositorio es únicamente la divulgación de la huella de carbono, no la distribución de un modelo funcional.

Aunque no es un modelo de IA, su existencia refleja una tendencia creciente en la industria hacia la estandarización de informes de sostenibilidad, como los propuestos por la iniciativa carbon.txt. Para un desarrollador o investigador, este repositorio puede servir como ejemplo de cómo documentar emisiones de entrenamiento, pero no ofrece ningún artefacto utilizable para inferencia o fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

Datos adicionales del registro de emisiones:

| Metrica | Valor |
|---|---|
| Hardware de entrenamiento | 7x NVIDIA V100 |
| Modo de entrenamiento | fine-tuning |
| Region | europe-west4 |
| Horas de GPU | 416,3 h (PUE: 1,52) |
| Energia total | 1328,8296 kWh |
| Emisiones de CO₂ | 265,766 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente, ya que este repositorio no incluye pesos, configuraciones ni codigo de entrenamiento. El unico dato relevante es que se realizo un fine-tuning sobre un modelo no especificado, utilizando 7 GPUs NVIDIA V100 durante 416,3 horas. El calculo de emisiones se realizo con CodeCarbon, una herramienta que estima el consumo energetico y las emisiones de CO₂ en funcion del hardware, la region y el tiempo de uso. No se menciona el dataset utilizado, el numero de tokens procesados ni ninguna tecnica de optimizacion como RLHF o DPO.

## Capacidades

- No aplica: este repositorio no contiene un modelo de IA con capacidades de generacion, razonamiento, codigo, vision o audio.
- Unicamente proporciona un registro de emisiones de carbono asociado a un entrenamiento previo.
- No incluye soporte para tool calling, agentes, ni funciones de inferencia.

## Casos de uso

- Reporte de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para documentar la huella de carbono de un entrenamiento, algo cada vez mas solicitado por organismos reguladores y clientes corporativos.
- Auditoria interna de consumo energetico: un equipo de ML puede usar este formato para registrar y comparar las emisiones de diferentes experimentos de fine-tuning.
- Educacion en IA responsable: en cursos universitarios, este tipo de tarjeta se utiliza para concienciar sobre el coste ambiental del entrenamiento de modelos.
- Cumplimiento de estandares emergentes: la estructura sigue las recomendaciones de carbon.txt y puede integrarse en directorios de sostenibilidad de IA.
- Transparencia en publicaciones academicas: los investigadores pueden adjuntar este tipo de registro a sus papers para declarar el impacto ambiental de sus experimentos.
- Comparativa de eficiencia entre proveedores de nube: al conocer la region y el hardware, se puede estimar el coste de carbono de diferentes configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo evaluable, por lo que no existen metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El entrenamiento registrado utilizo 7 GPUs NVIDIA V100, lo que indica un requisito de hardware de nivel profesional o de centro de datos.
- No se especifica la VRAM necesaria para inferencia, ya que no se distribuye ningun modelo.
- Para reproducir el entrenamiento se necesitaria un cluster con al menos 7 GPUs V100 (16 GB cada una) o equivalente.
- No es posible ejecutar este repositorio en una GPU de consumo (por ejemplo, RTX 4090) porque no contiene pesos ni codigo de inferencia.
- Las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no son aplicables al no existir un modelo.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, sino un documento de contabilidad de carbono. No existen modelos comparables en la misma categoria, ya que su funcion es completamente distinta a la de un LLM o un modelo de vision.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje natural, generacion de codigo, etc.
- La informacion sobre el modelo entrenado es inexistente: se desconoce la arquitectura, el tamano, el dataset y el proposito del fine-tuning.
- La licencia no esta especificada, por lo que no se puede determinar si el contenido puede reutilizarse comercialmente.
- Los datos de emisiones son estimaciones de CodeCarbon y pueden variar segun la metodologia de calculo.
- La fecha de creacion (2026-08-28) es posterior a la fecha actual, lo que sugiere que el repositorio podria ser un artefacto de una simulacion o un error de fecha.
- No se proporciona ningun enlace a un modelo base o a un paper que describa el trabajo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rakshit-negi/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/rakshitnegi1234/rakshitnegi1234
- Referencia sobre carbon.txt y tarjetas de modelo de IA: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
- Articulo sobre tarjetas de modelo de IA: https://aibuzz.blog/ai-model-cards-explained/
