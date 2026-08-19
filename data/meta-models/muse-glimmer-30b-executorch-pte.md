# meta-models/Muse-Glimmer-30B-ExecuTorch-PTE

## Resumen

Muse Glimmer 30B es un modelo de lenguaje causal de 30 mil millones de parámetros desarrollado por el Meta Superintelligence Lab, diseñado específicamente para tareas agénticas autónomas en hardware de consumo. Se trata de una versión destilada de Muse Spark, que integra razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal (texto e imagen) y recuperación ante fallos en un único modelo que se ejecuta localmente, sin necesidad de infraestructura en la nube ni conexión a red.

La relevancia de este modelo radica en su capacidad para ejecutar tareas complejas de agente en dispositivos locales, algo que tradicionalmente requería modelos mucho más grandes o servicios en la nube. Su arquitectura incluye un encoder de percepción dedicado para entrada de imágenes y una longitud de contexto de 131 072 tokens, lo que permite manejar conversaciones largas y documentos extensos. Además, se distribuye como artefactos PTE (ExecuTorch) preexportados para NVIDIA CUDA y Apple Silicon, lo que facilita su despliegue en entornos de producción sin necesidad de reimplementar el modelo por backend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal language model con perception encoder (detalles de arquitectura interna no disponibles) |
| Parametros totales | 30 000 millones (30B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131 072 tokens (128K) |
| Tipos de cuantizacion | k-quant-17G (~4 bits) y k-quant-dynamic (mayor precision) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PTE (ExecuTorch) y PTD (CUDA delegate blob) |

## Arquitectura y entrenamiento

La arquitectura de Muse Glimmer 30B se describe como un modelo de lenguaje causal con un encoder de percepción dedicado para entrada de imágenes. No se han proporcionado detalles sobre si se trata de un transformer estándar, una variante con atención lineal u otra innovación estructural. El modelo incorpora una técnica de decodificación especulativa denominada "block-diffusion speculative decoding" (DFlash), que permite acelerar la generación de tokens mediante un modelo auxiliar (drafter) que comparte embeddings y capa de salida con el modelo principal.

En cuanto al entrenamiento, se indica que el modelo es una destilación de Muse Spark, pero no se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de RLHF o DPO. Tampoco se especifica si el modelo fue entrenado con datos multilingües o solo en inglés. La información disponible se centra en la exportación a ExecuTorch y en las variantes de despliegue, no en los detalles del proceso de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo está diseñado para tareas agénticas que requieren planificación y ejecución de secuencias de acciones.
- Uso fiable de herramientas (tool calling): integra soporte para invocar funciones externas, lo que permite conectarse a APIs, bases de datos o ejecutar código.
- Comprensión multimodal: el encoder de percepción permite procesar imágenes junto con texto, habilitando tareas como análisis de capturas de pantalla o documentos escaneados.
- Recuperación ante fallos: el modelo puede detectar errores en la ejecución de tareas y reajustar su estrategia, una capacidad clave para agentes autónomos.
- Decodificación especulativa (DFlash): en las variantes `dflash`, se incluye un drafter que acelera la generación de tokens en GPUs capaces, mejorando el throughput.
- Ejecución local: al estar exportado a ExecuTorch, puede ejecutarse en dispositivos con NVIDIA CUDA (SM80+) o Apple Silicon sin conexión a internet.

## Casos de uso

- Asistente personal local: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K tokens) y ejecutar acciones como enviar correos, programar citas o controlar dispositivos domésticos, todo sin conexión a la nube.
- Automatización de tareas de oficina: gracias a su capacidad de tool calling, puede interactuar con hojas de cálculo, procesadores de texto o APIs internas para generar informes, resumir documentos o actualizar bases de datos.
- Análisis de documentos con imágenes: la modalidad `text-image` permite extraer información de capturas de pantalla, facturas escaneadas o diagramas, combinando comprensión visual y textual.
- Agente de código en entornos de desarrollo: puede integrarse en pipelines de CI/CD para revisar código, generar tests o corregir errores, utilizando su razonamiento multi-paso y acceso a herramientas de línea de comandos.
- Soporte técnico automatizado: con su contexto largo y capacidad de recuperación, puede mantener conversaciones de soporte complejas, consultar bases de conocimiento y escalar problemas cuando no puede resolverlos.
- Investigación académica: su capacidad de razonamiento y procesamiento de imágenes lo hace útil para analizar artículos científicos con figuras, resumir resultados y extraer conclusiones preliminares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo. La única información de rendimiento se refiere a las variantes de cuantización: `k-quant-dynamic` se describe como "mediblemente más cercano a precisión completa" que `k-quant-17G`, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: las variantes `k-quant-17G` requieren aproximadamente 24 GB de VRAM o memoria unificada; las variantes `k-quant-dynamic` requieren 32 GB.
- GPUs compatibles: NVIDIA con arquitectura SM80 o superior (RTX 30xx, RTX 40xx, A100, H100) y Apple Silicon (M1, M2, M3 y posteriores). No hay soporte para CPU.
- Tamaño de descarga: cada variante ocupa entre 17,9 GB y 31,5 GB, dependiendo de la cuantización, modalidad y decodificación. El repositorio completo pesa 372 GB, por lo que se recomienda descargar solo la variante necesaria.
- Opciones de despliegue: el modelo se sirve mediante el runtime de ExecuTorch, que carga los artefactos PTE/PTD. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que el formato es específico de ExecuTorch.
- Latencia y throughput: no se han proporcionado cifras concretas. Se indica que las variantes `dflash` son "significativamente más rápidas" en GPUs capaces, pero sin datos numéricos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de 30B parámetros. Aunque existen alternativas como Llama 3 30B o Mistral 30B, no se han publicado datos de rendimiento ni especificaciones detalladas de Muse Glimmer que permitan una comparación objetiva. La única referencia es que es una destilación de Muse Spark, pero no se conocen las características de ese modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, es probable que herede sesgos de género, raza o cultura presentes en esos datos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o cuando se le pide información factual no presente en su entrenamiento.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que se desconoce si el modelo funciona bien en español u otros idiomas distintos del inglés.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe revisar el archivo `USAGE_POLICY.md` incluido en el repositorio para conocer posibles restricciones adicionales de uso.
- Requisitos de hardware específicos: no hay soporte para CPU, y las variantes requieren al menos 24 GB de VRAM, lo que excluye a muchas GPUs de gama media. Además, el formato PTE/PTD es exclusivo de ExecuTorch, por lo que no se puede usar con otros runtimes sin una conversión adicional.
- Tamaño de descarga: el repositorio completo es muy grande (372 GB), y es fácil descargar accidentalmente todas las variantes si no se usan filtros `--include`. Se recomienda seguir las instrucciones de descarga selectiva.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/meta-models/Muse-Glimmer-30B-ExecuTorch-PTE)
- [Anuncio del equipo de PyTorch sobre ExecuTorch para IA agéntica](https://pytorch.org/blog/fast-ondevice-agentic-ai-with-executorch/)
- [Guía de Muse Glimmer en el repositorio de ExecuTorch](https://github.com/pytorch/executorch/blob/main/examples/models/muse-glimmer/README.md)
