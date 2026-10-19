# mhseo2/opd_sftb8dm15e_s2000_qwen3moe30b_ot3math-step70

## Resumen

`mhseo2/opd_sftb8dm15e_s2000_qwen3moe30b_ot3math-step70` es un checkpoint publicado en HuggingFace por el usuario `mhseo2`, con 16 descargas y sin ningún "like" en el momento de la consulta. Por la nomenclatura del repositorio se trata de un artefacto de entrenamiento (un checkpoint intermedio de un proceso de ajuste supervisado, probablemente con destilación on-policy) construido sobre la familia Qwen3 MoE y orientado a matemáticas, concretamente a partir de datos tipo OpenThoughts3. No existe model card, ni pipeline declarado, ni licencia, ni idiomas, ni resultados de evaluación publicados.

El dato objetivo disponible es el recuento de safetensors: 8.190.735.360 parámetros, con un repositorio de 16,4 GB, lo que es coherente con pesos en bf16 (2 bytes por parámetro). Ese recuento no coincide con los aproximadamente 30.500 millones de parámetros del Qwen3-30B-A3B canónico, por lo que el sufijo "qwen3moe30b" del nombre debe interpretarse como la configuración de entrenamiento de origen y no como el tamaño real del checkpoint publicado; conviene verificarlo antes de reutilizarlo.

Su relevancia es limitada y de carácter experimental: sirve como referencia para quienes reproducen recetas de SFT sobre modelos MoE con datos matemáticos, pero no es un modelo listo para producción al no haber documentación, licencia ni evaluación. Cualquier uso requiere inspeccionar la configuración de arquitectura incluida en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el nombre indica familia Qwen3 MoE (transformer decoder-only con mezcla de expertos), no confirmado |
| Parametros totales | 8.190.735.360 (recuento real de safetensors) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors (sin GGUF ni AWQ/GPTQ publicados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors (16,4 GB, consistente con bf16) |

## Arquitectura y entrenamiento

No hay información oficial sobre el proceso de entrenamiento. La nomenclatura del repositorio sugiere, sin confirmación, varios elementos: un prefijo `opd` que podría corresponder a destilación on-policy, un bloque `sftb8dm15e_s2000` que apunta a un ajuste supervisado con un paso 2000 como checkpoint, `qwen3moe30b` como modelo base de la familia Qwen3 MoE, y `ot3math-step70` como identificador del conjunto de datos matemático (probablemente OpenThoughts3 Math) y de un paso 70 dentro de una etapa posterior. Son inferencias a partir del nombre, no hechos documentados.

Como referencia de la familia, Qwen3-30B-A3B es un transformer decoder-only con 48 capas, 128 expertos por capa y 8 activos por token, con 30.500 millones de parámetros totales y 3.300 millones activos, contexto nativo de 32.768 tokens extensible a 131.072 mediante YaRN, y entrenamiento en dos fases con razonamiento explícito seguido de fusión de modos. El checkpoint aquí descrito no reproduce ese recuento de parámetros, por lo que la correspondencia exacta con esa arquitectura está por verificar leyendo el `config.json` del repositorio.

## Capacidades

- Generación de texto y razonamiento matemático: el nombre indica un ajuste orientado a problemas matemáticos, presumiblemente con cadenas de razonamiento largas; no hay evaluación que lo confirme.
- Razonamiento multi-paso: plausible por el origen (datos tipo OpenThoughts3), sin verificar.
- Generación de código: no documentada para este checkpoint; dependería de lo preservado del modelo base.
- Tool calling / function calling: no documentado.
- Capacidades de agente: no documentadas.
- Multilingüismo: no documentado; el modelo base Qwen3 es multilingüe, pero este ajuste puede haber reducido esa cobertura.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles.

## Casos de uso

- Investigación en recetas de SFT sobre MoE: el checkpoint permite comparar curvas de pérdida y comportamiento en el paso 2000 frente al modelo base, útil para estudiar estabilidad de entrenamiento en arquitecturas con mezcla de expertos.
- Reproducción de experimentos de razonamiento matemático: sirve como punto de comparación frente a otros checkpoints de la misma tanda (`step70`, etc.) para aislar el efecto del número de pasos.
- Extracción de trazas de razonamiento para destilación: si el ajuste conserva cadenas de pensamiento, puede emplearse para generar datos sintéticos de problemas matemáticos que luego se filtran y se usan en modelos menores.
- Evaluación de olvido catastrófico: al ser un ajuste estrecho sobre matemáticas, es un caso de estudio útil para medir cuánto se degradan capacidades generales (redacción, código, multilingüismo) tras el SFT.
- Análisis de mecánica interna de MoE: con 8.190 millones de parámetros almacenados, cabe en una sola GPU de 24 GB en bf16, lo que facilita estudios de enrutamiento de expertos y activaciones sin necesidad de infraestructura distribuida.
- Pruebas de cuantización: al no existir versiones GGUF publicadas, es un candidato para generar cuantizaciones propias (Q4_K_M, Q8_0) y medir la degradación en tareas de matemáticas.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún despliegue orientado a usuarios finales, dada la ausencia de licencia, evaluación y documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 16,4 GB; con caché KV y overhead del runtime hay que prever entre 20 y 24 GB para contextos moderados.
- VRAM en cuantización int8: alrededor de 9-10 GB de pesos, más caché KV; manejable en GPUs de 16-24 GB.
- VRAM en cuantización de 4 bits: aproximadamente 5-6 GB de pesos; cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070.
- GPU recomendadas: A100 40 GB u H100 para evaluación con contextos largos y batch grande; RTX 4090 (24 GB) para inferencia en bf16 con batch pequeño; RTX 3090/4080 como mínimo práctico en bf16.
- Cabe en GPU de consumo: sí, en bf16 con 24 GB (RTX 3090, 4090) y en cuantizaciones de 8 y 4 bits en GPUs de 12-16 GB.
- Opciones de despliegue: vLLM y TGI para servicio con concurrencia (verificando primero que el `config.json` declare correctamente la arquitectura MoE); llama.cpp y Ollama tras convertir los pesos a GGUF, conversión que hay que realizar uno mismo al no haber artefactos publicados.
- Throughput y latencia: no disponibles; al ser un MoE, la latencia depende del número de expertos activos, dato que no consta en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`opd_sftb8dm15e_s2000_qwen3moe30b_ot3math-step70`) | 8.190.735.360 | No disponible | No disponible | No declarada | HuggingFace, 16 descargas |
| Qwen3-30B-A3B (base de referencia de la familia) |unos 30.500 millones | unos 3.300 millones | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | Amplia, con cuantizaciones oficiales |
| Qwen3-8B | unos 8.200 millones | denso | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | Amplia |
| Qwen2.5-Math-7B | unos 7.600 millones | denso | 4.096 nativo | Apache 2.0 (con condiciones de atribución) | Amplia, orientado a matemáticas |

La comparación es aproximada: el recuento de parámetros de este checkpoint se acerca al de Qwen3-8B, no al de Qwen3-30B-A3B, mientras que el nombre sugiere lo segundo. Los datos de la familia Qwen3 provienen de documentación pública y no han sido verificados contra el `config.json` de este repositorio.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripción de datos, hiperparámetros, tokenizador ni plantilla de chat, lo que impide reproducir el entrenamiento o garantizar el formato de prompt correcto.
- Licencia no declarada: no puede asumirse la Apache 2.0 del modelo base. El uso comercial es jurídicamente incierto y requiere contactar con el autor.
- Discrepancia de tamaño: 8.190 millones de parámetros almacenados frente a los aproximadamente 30.500 millones que sugiere el nombre. Puede tratarse de un recorte, de una exportación parcial o de un error de empaquetado; un `from_pretrained` puede fallar si faltan tensores.
- Riesgo de sobreajuste: un SFT de 2000 pasos sobre un corpus matemático estrecho tiende a degradar capacidades generales y a producir respuestas rígidas fuera de dominio.
- Riesgo de alucinación: en problemas matemáticos, los modelos ajustados con cadenas de razonamiento largas pueden generar justificaciones plausibles con resultados incorrectos; no se ha medido su tasa de error.
- Idiomas: desconocidos. Un ajuste sobre datos mayoritariamente ingleses puede degradar el rendimiento en castellano.
- Sin evaluación: no hay MMLU, GSM8K, MATH ni HumanEval publicados, por lo que no hay evidencia de que mejore al modelo base.
- Fecha de creación anómala (2026-10-19) en los metadatos: conviene verificar la procedencia del repositorio.
- Sesgos: no evaluados. Hereda los del corpus de preentrenamiento de Qwen3 y los del dataset de instrucciones empleado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mhseo2/opd_sftb8dm15e_s2000_qwen3moe30b_ot3math-step70
- Qwen3-30B-A3B (modelo base de referencia de la familia): https://huggingface.co/Qwen/Qwen3-30B-A3B
- No se han proporcionado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
