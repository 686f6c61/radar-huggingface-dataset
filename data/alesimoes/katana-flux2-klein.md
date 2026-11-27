# alesimoes/katana-flux2-klein

## Resumen

katana-flux2-klein es un paquete de pesos en formato GGUF del modelo de difusion FLUX.2 [klein] 4B, desarrollado originalmente por Black Forest Labs y convertido por el usuario alesimoes para su uso con katana, un motor de inferencia escrito en C desde cero. No se trata de un modelo nuevo ni de un fine-tuning: son conversiones de formato puras de los pesos upstream, sin reentrenamiento, sin ajuste fino y sin fusion de modelos.

El paquete incluye tres componentes: el transformer de difusion cuantizado a Q4_K_M, el VAE de imagenes y el codificador de texto Qwen3 4B, este ultimo mantenido a mayor precision. El modelo base suma 3.875.544.576 parametros y el repositorio ocupa 9,2 GB. La licencia declarada es Apache-2.0, heredada del modelo upstream.

Su relevancia es acotada pero concreta: permite ejecutar generacion y edicion de imagenes con FLUX.2 [klein] 4B en el motor katana con pesos verificables por sha256 contra un catalogo integrado. La advertencia principal es que los ficheros siguen la nomenclatura de tensores propia de katana, por lo que no deben esperarse cargas correctas en otras herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer de difusion) con VAE y codificador de texto Qwen3 4B |
| Parametros totales | 3.875.544.576 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (transformer); VAE y codificador de texto a mayor precision |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tres ficheros: transformer, VAE y text encoder) |

## Arquitectura y entrenamiento

El modelo upstream FLUX.2 [klein] 4B es un modelo de difusion para generacion y edicion de imagenes. La conversion incluye el transformer de difusion como componente principal (cuantizado a Q4_K_M), un VAE para codificar y decodificar imagenes, y un codificador de texto basado en Qwen3 4B que transforma las instrucciones textuales en representaciones internas.

No hubo entrenamiento alguno en esta publicacion: la model card indica explicitamente que son conversiones de formato, sin reentrenamiento, ajuste fino ni fusion. Por tanto, no se dispone de informacion sobre volumen de datos, composicion del dataset ni tecnicas de alineacion como RLHF o DPO. La innovacion tecnica relevante es de empaquetado: los tensores se renombran segun la convencion propia de katana y se distribuyen con verificacion de integridad mediante sha256 contra un catalogo integrado del motor.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), segun el pipeline declarado.
- Edicion de imagenes, segun las etiquetas del repositorio.
- Codificacion de instrucciones textuales mediante un codificador Qwen3 4B.
- Ejecucion en katana, motor de inferencia en C, con descarga y verificacion de pesos integradas (`katana pull flux2-klein`).
- Verificacion de integridad de cada fichero por sha256 frente al catalogo del motor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni vision de entrada.

## Casos de uso

- Generacion de ilustraciones y material grafico: el transformer de difusion produce imagenes a partir de descripciones textuales procesadas por el codificador Qwen3 4B, adecuado para prototipado visual rapido en local.
- Edicion de imagenes existentes: las etiquetas del repositorio incluyen image-editing, de modo que el modelo puede emplearse para modificar imagenes segun instrucciones en lenguaje natural.
- Despliegue en entornos con recursos limitados: la cuantizacion Q4_K_M del transformer reduce el peso del componente principal frente a los pesos originales, lo que facilita su ejecucion en hardware modesto.
- Integracion en pipelines propios basados en C: al estar pensado para katana, encaja en flujos donde se prefiera un motor ligero escrito en C frente a stacks Python.
- Experimentacion e investigacion con modelos de difusion: sirve para estudiar el comportamiento de FLUX.2 [klein] 4B bajo cuantizacion Q4_K_M manteniendo VAE y text encoder a mayor precision.
- Reproducibilidad y auditoria de pesos: la comprobacion sha256 contra el catalogo de katana permite verificar que los ficheros descargados son los esperados antes de usarlos en produccion.
- Generacion de assets en local sin dependencia de servicios en la nube: el paquete completo (9,2 GB) puede alojarse en una maquina propia y usarse con el motor katana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 9,2 GB, aunque el transformer cuantizado a Q4_K_M es el componente mas pesado y los pesos pueden residir parcialmente en RAM segun la implementacion de katana.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la cuantizacion Q4_K_M del transformer sugiere que el componente principal podria caber en GPU de consumo con VRAM suficiente, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: katana (motor previsto, con `katana pull flux2-klein`). No se garantiza la carga en vLLM, llama.cpp, Ollama ni TGI, ya que los tensores siguen la nomenclatura propia de katana.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| katana-flux2-klein (esta ficha) | 3.875.544.576 | No disponible | Apache-2.0 | GGUF (nomenclatura katana) | Hugging Face, motor katana |
| FLUX.2 [klein] 4B (upstream) | 4B (aproximado por nombre) | No disponible | Apache-2.0 | Pesos originales (safetensors y otros) | Hugging Face, Black Forest Labs |
| FLUX.2 [klein] 9B (upstream) | 9B (aproximado por nombre) | No disponible | No comercial (segun la model card citada) | Pesos originales | Hugging Face, Black Forest Labs |

La comparativa se limita a las variantes del mismo modelo familia, ya que no se dispone de datos de benchmarks ni de especificaciones de contexto que permitan contrastar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- No es un modelo nuevo: son conversiones de formato de los pesos upstream, sin mejoras de calidad respecto a FLUX.2 [klein] 4B.
- Los ficheros siguen la nomenclatura de tensores propia de katana; no deben esperarse cargas correctas en otras herramientas de inferencia.
- La cuantizacion Q4_K_M del transformer puede introducir perdida de calidad frente a los pesos originales en precision completa.
- No se dispone de informacion sobre sesgos, tasas de alucinacion visual ni limitaciones de idioma del codificador de texto.
- Riesgo de generacion de contenido inapropiado o no deseado inherente a los modelos text-to-image; la model card upstream incluye notas de seguridad y uso aceptable que deben consultarse.
- La licencia Apache-2.0 se hereda del upstream, pero debe verificarse en la model card original antes de uso comercial, junto con sus notas de uso aceptable.
- El modelo de 9B de la misma familia tiene licencia no comercial y no forma parte de este repositorio; no debe confundirse con este paquete.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alesimoes/katana-flux2-klein
- Modelo upstream: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Motor katana: https://github.com/alesimoes/katana
- Documentacion de distribucion de katana: `docs/distribution.md` en el repositorio de katana
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
