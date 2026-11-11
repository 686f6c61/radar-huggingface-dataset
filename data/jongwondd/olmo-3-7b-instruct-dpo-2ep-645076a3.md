# Jongwondd/OLMo-3-7B-Instruct-DPO-2ep-645076a3

## Resumen

OLMo-3-7B-Instruct-DPO-2ep-645076a3 es un adaptador LoRA (no fusionado) entrenado mediante DPO sobre el modelo base allenai/Olmo-3-7B-Instruct. Lo publica el usuario Jongwondd en Hugging Face como artefacto de investigación centrado en "negation training", es decir, el ajuste del comportamiento del modelo en torno a la negación. No es un modelo autónomo ni un checkpoint fusionado: requiere cargar el modelo base por separado y aplicar el adaptador con PEFT.

El adaptador se entrenó sobre el split de entrenamiento de PopQA (14.951 pares / 4.534 casos) durante dos épocas completas, con 29.902 ejemplos vistos y 1.892 pasos de optimizador. Usa LoRA con rango 16, alpha 32 y dropout 0. La relevancia es acotada: se trata de un checkpoint de investigación con cero descargas y sin resultados de evaluación publicados, útil para quien quiera reproducir o auditar experimentos de DPO sobre OLMo 3 y estudiar efectos en tareas de negación.

No se dispone de información sobre arquitectura interna, número de parámetros totales ni longitud de contexto más allá de lo que herede del modelo base OLMo-3-7B-Instruct, cuyos detalles no se incluyen en la información proporcionada. El autor advierte explícitamente que no es un modelo validado para producción y que las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base: allenai/Olmo-3-7B-Instruct); arquitectura interna del base no disponible |
| Parametros totales | No disponible (adaptador LoRA r=16 sobre base de 7B; recuento exacto del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base; no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el base admite las cuantizaciones que soporte Transformers/PEFT) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere pesos del base por separado |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32, con dropout 0, aplicado sobre el modelo allenai/Olmo-3-7B-Instruct en la revisión `6e5971d9eba42665f5bd5a0fcf047f299ce1dccc`. El entrenamiento utilizó DPO (Direct Preference Optimization) partiendo de una inicialización fresca del adaptador sobre el base. Se completaron dos épocas sobre el split de entrenamiento de PopQA, con 14.951 pares y 4.534 casos, lo que supone 29.902 ejemplos vistos y 1.892 pasos de optimizador.

Los pesos del adaptador no se han modificado respecto al entrenamiento original (SHA-256 `645076a3449524799a678d6a09be83ceccac93fb73244b10d42736af069ce623`); solo se ha hecho portable el localizador del modelo base y su revisión en la configuración PEFT. El hash original y el publicado se registran en `training_provenance.json`, que también contiene el objetivo específico del método, los hiperparámetros retenidos y los hashes del resumen de fuentes y de los datos de entrenamiento. El autor indica que las baselines SFT/UL/DPO son ejecuciones distintas y no checkpoints ALiT, y que las pérdidas de entrenamiento no son puntuaciones de evaluación. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada del modelo base OLMo-3-7B-Instruct.
- Ajuste específico orientado a tareas de negación ("negation training"), aunque no se documentan métricas que cuantifiquen la mejora.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (dependería del base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada; la model card menciona "image inputs when applicable" del base, pero no confirma que el adaptador las preserve.
- No se publican resultados de evaluación que respalden ninguna capacidad concreta.

## Casos de uso

- Investigación sobre DPO y negación: reproducir el entrenamiento y analizar cómo el ajuste por preferencias altera el tratamiento de la negación en el modelo base, usando el adaptador como punto de partida auditable.
- Auditoría de adaptadores PEFT: verificar la paridad entre la configuración original y la publicada mediante los hashes registrados en `training_provenance.json`.
- Experimentos controlados de alineación: comparar el comportamiento del base frente al base + adaptador en tareas de preferencia, dado que el autor distingue explícitamente las baselines SFT/UL/DPO.
- Estudio de robustez ante negación en pipelines de extracción de información: evaluar si el adaptador reduce errores de polaridad en consultas del tipo "X no es Y".
- Docencia y formación: usar el checkpoint como ejemplo de flujo completo de DPO con LoRA sobre un modelo abierto de 7B, incluyendo la carga con Transformers y PEFT.
- Prototipado interno no crítico: probar el adaptador en entornos de desarrollo con el base cargado en bfloat16 y `device_map="auto"`, siempre con revisión humana de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta subida no añade resultados de evaluación, que los splits previamente observados son datos de desarrollo y no test independiente, y que las puntuaciones proxy basadas en reglas no equivalen a precisión de un juez semántico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al requerir el base OLMo-3-7B-Instruct en bfloat16, se necesitan aproximadamente 14-16 GB solo para los pesos del base, más overhead de activaciones y del adaptador.
- GPU recomendadas: no especificadas por el autor. Por tamaño del base, serían razonables A100, H100 o RTX 4090 para bfloat16.
- Compatibilidad con GPU de consumo: probable en GPUs con 24 GB o más (por ejemplo RTX 4090) usando bfloat16 o cuantización del base; no confirmado por el autor.
- Opciones de despliegue: Transformers + PEFT (flujo documentado en la model card). vLLM, llama.cpp, Ollama o TGI no se mencionan; la integración con ellos requeriría fusionar el adaptador o usar soporte específico de adaptadores, no verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jongwondd/OLMo-3-7B-Instruct-DPO-2ep-645076a3 | Adaptador LoRA sobre base de 7B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación, sin evaluación publicada |
| allenai/Olmo-3-7B-Instruct (base) | 7B (según nombre) | No disponible en esta ficha | No disponible en esta ficha | Hugging Face | Modelo base sobre el que se aplica el adaptador |
| Otros adaptadores DPO comunitarios sobre OLMo | Variable | No disponible | Variable | Hugging Face | No se dispone de datos comparativos verificables |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar el modelo base allenai/Olmo-3-7B-Instruct, con acceso al upstream cuando sea necesario.
- No es un checkpoint fusionado ni un export listo para producción; es un adaptador LoRA de investigación.
- Sin resultados de evaluación publicados: no hay evidencia de mejora medible en tareas de negación ni en otras capacidades.
- Los splits de evaluación previamente observados son datos de desarrollo, no test independiente.
- Las pérdidas de entrenamiento no son puntuaciones de evaluación.
- Riesgo de salidas incorrectas, sesgadas, malformadas o repetitivas, según advierte el propio autor.
- Idioma limitado al inglés según la model card.
- No validado para seguridad en producción.
- La licencia Apache 2.0 se aplica al adaptador, pero el autor remite a la licencia upstream y a `LICENSE`, `NOTICE` y `USE_POLICY.md` del modelo base; conviene revisar las restricciones de uso del upstream antes de un uso comercial.
- La paridad de descarga e inferencia desde el Hub público no está garantizada; solo se verificó localmente el parseo de la configuración del adaptador.
- No se implica afiliación ni respaldo por parte del proveedor del modelo base.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Jongwondd/OLMo-3-7B-Instruct-DPO-2ep-645076a3
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Revisión del base referenciada: `6e5971d9eba42665f5bd5a0fcf047f299ce1dccc`
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio Transformers: https://github.com/huggingface/transformers
- Dataset PopQA (referenciado como población de entrenamiento): no se proporciona enlace en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
