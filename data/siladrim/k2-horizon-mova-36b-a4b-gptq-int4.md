# Siladrim/K2-Horizon-MoVA-36B-A4B-GPTQ-Int4

## Resumen

El modelo K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por el Institute of Foundation Models (IFM) de MBZUAI, lanzado el 3 de septiembre de 2026. Se trata de un modelo disperso con 36.000 millones de parámetros totales y aproximadamente 4.000 millones activos por token, lo que permite un coste computacional reducido en inferencia. Su característica distintiva es la atención MoVA (Mixture-of-Values), donde la proyección de valores se sustituye por un enrutado de 64 expertos de valor, complementado con una FFN MoE de 100 expertos. El contexto nativo alcanza 512.000 tokens.

Esta ficha documenta la cuantización GPTQ 4-bit publicada por la comunidad bajo el repositorio Siladrim/K2-Horizon-MoVA-36B-A4B-GPTQ-Int4. La cuantización reduce el tamaño en disco de aproximadamente 76 GB a 21 GB, permitiendo cargar el modelo en una única GPU de 48 GB, frente a las dos GPUs necesarias para la versión BF16 original. El modelo base se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y en investigación.

La relevancia del modelo radica en su combinación de un contexto de 512K tokens con un coste de activación muy bajo, lo que lo hace especialmente apto para tareas agénticas y de razonamiento. Según afirmaciones cualitativas de Benchgen, supera a modelos densos y MoE de hasta 15 veces su tamaño activo en benchmarks de agentes y razonamiento. La cuantización aquí documentada añade una opción práctica para desplegarlo en entornos con menos memoria, aunque requiere un soporte técnico específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k2_horizon (transformers con trust_remote_code): FFN MoE de 100 expertos (top-8) + experto compartido; MoVA attention con 64 expertos de valor (top-4) |
| Parametros totales | 37.444.792.020 (según safetensors del checkpoint cuantizado; el modelo base declara 36B) |
| Parametros activos | ~4B (según el modelo base; no disponible para el checkpoint cuantizado) |
| Longitud de contexto | 512.000 tokens |
| Tipos de cuantizacion | GPTQ 4-bit (group size 128, simétrico, desc_act=false); routers, lm_head, embeddings y normas en BF16 |
| Idiomas soportados | en (según HuggingFace); verificado en alemán e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GPTQ (safetensors), requiere trust_remote_code |

## Arquitectura y entrenamiento

El modelo base IFM/K2-Horizon-MoVA-36B-A4B presenta una arquitectura dispersa no convencional. Además de una FFN MoE con 100 expertos, de los cuales se seleccionan 8 por token y se añade un experto compartido, incorpora la atención MoVA: la proyección de valores de cada capa de atención se sustituye por un conjunto de 64 expertos de valor enrutados, de los que se activan 4 por token, gobernados por un router de valores independiente. Este diseño reduce el coste de atención en contextos largos.

La cuantización GPTQ 4-bit fue realizada por un contribuyente independiente (Siladrim) con GPTQModel 7.3.6, transformers 5.16 y torch 2.14. Se calibró con 512 muestras, principalmente del corpus C4 en inglés, con algo de alemán y código para cubrir expertos multilingües. El proceso se ejecutó en una NVIDIA L40S de 48 GB y tardó aproximadamente 5,3 horas. La cuantización no es trivial, porque GPTQModel asume un único conteo de expertos; se empleó una definición de modelo personalizada (k2_horizon_def.py) que escribe explícitamente los 64 expertos de valor mientras expande dinámicamente los 100 expertos FFN. Se cuantizaron 372 módulos lineales por capa dispersa, mientras que los routers, lm_head, embeddings y todas las normas se mantienen en BF16. No se ha publicado información detallada sobre el preentrenamiento o el ajuste del modelo base (por ejemplo, si se utilizó RLHF o DPO).

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento: el modelo puede emitir razonamiento paso a paso dentro de las etiquetas `<ifm|think>...</ifm|think>`, activado por petición mediante el parámetro `reasoning_effort` del chat template.
- Contexto largo de 512K tokens, apto para procesar documentos extensos, repositorios de código o transcripciones completas.
- Capacidades agénticas y de razonamiento multi-step: según Benchgen, destaca en benchmarks de agentes y razonamiento, superando a modelos densos y MoE de hasta 15 veces su tamaño activo.
- Soporte multilingüe limitado: el idioma declarado en HuggingFace es inglés, pero la calibración incluyó alemán y código, y se verificó salida coherente en alemán e inglés.
- Tool calling / function calling: no documentado en la información disponible.
- Integración con transformers y GPTQModel: el modelo se puede cargar con `trust_remote_code` y la definición personalizada.

## Casos de uso

- Procesamiento de documentos extensos: gracias a la ventana de contexto de 512K, el modelo puede analizar contratos, informes legales o libros completos en una sola pasada, manteniendo coherencia entre pasajes muy distantes.
- Sistemas agénticos de razonamiento: los benchmarks agénticos destacan su capacidad para resolver tareas de varios pasos; puede usarse como núcleo de un agente que planifica, ejecuta y reflexiona.
- Generación de código en entornos con memoria limitada: la cuantización Int4 permite ejecutarlo en una única GPU de 48 GB, lo que lo hace viable para desarrollo de herramientas de asistencia de código en servidores on-premise.
- Asistentes bilingües alemán-inglés: se ha verificado que produce salida coherente en ambos idiomas, por lo que puede desplegarse en aplicaciones de atención al cliente en estos mercados.
- Investigación en arquitecturas MoE y MoVA: al ser Apache-2.0 y estar disponible la definición personalizada, el checkpoint cuantizado permite estudiar el comportamiento de los expertos de valores y comparar con otras implementaciones.
- Análisis de código legacy o auditoría de repositorios: con su contexto largo y capacidad de razonamiento, puede revisar repositorios completos para detectar patrones de seguridad o errores.
- Soporte de razonamiento explicable: el modo de pensamiento (`<ifm|think>`) permite generar justificaciones paso a paso, útil en aplicaciones de educación o toma de decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Fuentes secundarias como Benchgen y AI/TLDR mencionan afirmaciones cualitativas sobre su superioridad en benchmarks agénticos y de razonamiento, pero no se proporcionan cifras concretas en los datos consultados.

## Requisitos de hardware

- VRAM estimada: el checkpoint cuantizado ocupa aproximadamente 21 GB en disco; con el overhead de inferencia, es viable en una GPU de 48 GB.
- GPU recomendadas: NVIDIA L40S (utilizada para la cuantización), A100 o H100 de 80 GB también servirían con holgura.
- No es viable en GPUs de consumo de 24 GB (como la RTX 4090) sin una cuantización más agresiva.
- Opciones de despliegue: GPTQModel / transformers con `trust_remote_code` y la definición personalizada `k2_horizon_def.py`. vLLM y SGLang solo soportan la versión BF16 del modelo base con `--tensor-parallel-size 2`; no existe una vía de servido cuantizada en el código upstream.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos comparables en los datos consultados. El modelo base IFM/K2-Horizon-MoVA-36B-A4B sirve como referencia directa: la versión BF16 requiere dos GPUs de 48 GB y ocupa ~76 GB, mientras que la cuantización Int4 ocupa ~21 GB y cabe en una sola GPU de 48 GB. No se dispone de datos de benchmarks comparativos con otros modelos.

## Limitaciones y advertencias

- La cuantización es comunitaria y no está respaldada por MBZUAI IFM; no se garantiza su rendimiento exacto en todos los escenarios.
- No existe soporte de servido cuantizado en vLLM o SGLang; es necesario usar GPTQModel/transformers, lo que limita su integración en pipelines de producción estándar.
- El kernel Marlin requiere `ninja` y un toolchain CUDA para compilarse; si no está disponible, se debe usar `backend=BACKEND.TORCH`, que es más lento.
- El checkpoint cuantizado requiere `trust_remote_code` y la definición personalizada incluida en el repositorio, lo que supone un riesgo de seguridad si no se audita el código.
- El idioma declarado es únicamente inglés, aunque se ha verificado en alemán e inglés; el soporte para otros idiomas no está documentado.
- Los parámetros totales del checkpoint cuantizado (37.444.792.020) difieren de los 36B declarados del modelo base, debido a la preservación en BF16 de routers, lm_head, embeddings y normas.
- Riesgo de alucinación: al ser un modelo de lenguaje, existe riesgo general de generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Sesgos conocidos: no se han documentado sesgos específicos en la información proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/Siladrim/K2-Horizon-MoVA-36B-A4B-GPTQ-Int4
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- AI/TLDR: https://ai-tldr.dev/models/k2-horizon-mova-36b-a4b/
- Benchgen: https://benchgen.com/models/ifm/k2-horizon-mova-36b-a4b
