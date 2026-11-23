# muhammad-ibraheem/xvla-recap-v2-20k

## Resumen

X-VLA + Recap round 2 (20k pasos) es un checkpoint de política visomotora (VLA, vision-language-action) para robótica de manipulación fina, desarrollado por Muhammad Ibraheem en el contexto del curso EEE 598 AI for Industry Challenge (AIC). El modelo resuelve la tarea concreta de inserción de cables (cable insertion) en un entorno simulado, partiendo de la base X-VLA y aplicando una segunda iteración de fine-tuning condicionado por ventaja (Recap), inspirada en el enfoque π*0.6 de Physical Intelligence.

El checkpoint tiene 879.687.256 parámetros (aproximadamente 880 millones) y se distribuye en formato safetensors con la librería LeRobot. A diferencia de los LLM generalistas, se trata de un modelo especializado: consume tres cámaras de muñeca a resolución 256x288 más un vector de estado de 19 valores (pose del TCP, velocidades y fuerza/par en la muñeca) y produce acciones de control. El autor lo señala explícitamente como el mejor checkpoint del proyecto, con 1229 puntos en 36 ensayos frente a 1163 y 1052 de las versiones anteriores.

Su relevancia es doble: por un lado, documenta una receta reproducible de RL por filtrado de ventaja sobre un VLA preentrenado; por otro, muestra que el sobreentrenamiento degrada el rendimiento (el checkpoint de 40k pasos cae a 949 puntos). Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en X-VLA; detalles de capas no disponibles |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (la entrada textual es una instruccion de tarea con sufijo " Advantage: positive") |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `xvla-recap-v1`, que a su vez deriva de X-VLA (`xvla-aic-v4`). La arquitectura subyacente es un VLA que fusiona observaciones visuales (tres cámaras de muñeca a 256x288) y un estado proprioceptivo de 19 valores (pose del TCP, velocidades y fuerza/par) con una instrucción textual de tarea para emitir acciones. No se detallan en la información disponible el número de capas, la dimensión oculta ni el mecanismo de atención.

El entrenamiento sigue una receta de RL por condicionamiento de ventaja (Recap, inspirada en π*0.6 de Physical Intelligence). Se recopilaron 380 rollouts (120 del modelo X-VLA base y 260 del modelo de la ronda 1) en dos simuladores en paralelo, se entrenó una función de valor privilegiada con validación cruzada (correlación 0,55) y se seleccionó el 30% superior de fragmentos de 1 segundo, junto con fragmentos de inserción etiquetados `Advantage: positive`, más 585 demostraciones CheatCode. El fine-tuning parte de `xvla-recap-v1`; este checkpoint corresponde a 20k pasos, ya que el de 40k pasos mostró sobreentrenamiento. El dataset asociado es `aic-recap-v2`.

## Capacidades

- Control visomotor para inserción de cables en simulación, a partir de observaciones multimodales (tres vistas de muñeca más estado proprioceptivo).
- Condicionamiento por instrucción textual de tarea, con sufijo de ventaja `" Advantage: positive"` aplicado por el servidor del proyecto (`aic_context.json`).
- Política de acciones de horizonte corto, entrenada sobre fragmentos de 1 segundo.
- Aprendizaje por refuerzo offline mediante filtrado de ventaja y función de valor privilegiada.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; la única entrada textual documentada es la instrucción de tarea en inglés del benchmark AIC.

## Casos de uso

- Inserción de cables en simulación: es el caso de uso nativo del checkpoint; se ejecuta mediante `scripts/run_smolvla_server.sh` apuntando al directorio del checkpoint y obtiene 1229 puntos en 36 ensayos del protocolo AIC.
- Reproducción de experimentos de RL sobre VLA: sirve como referencia para comparar recetas de condicionamiento por ventaja frente a fine-tuning supervisado, dado que el autor publica la curva completa (v1, v2 a 20k y v2 a 40k).
- Investigación sobre sobreentrenamiento: el par 20k/40k permite estudiar la degradación de política con pasos extra (1229 frente a 949 puntos).
- Generación de datos sintéticos para imitación: los rollouts del modelo pueden alimentar datasets de entrenamiento posteriores, como se hizo con los 260 rollouts de la ronda 1 usados en esta ronda.
- Docencia y prácticas de robótica: el pipeline LeRobot más servidor SmolVLA permite montar un laboratorio de políticas visomotoras con un único checkpoint de 1,8 GB.
- Evaluación comparativa de arquitecturas VLA: al compartir base X-VLA con `xvla-aic-v4`, permite aislar el efecto del Recap sobre la misma política.

## Benchmarks y rendimiento

Resultados del protocolo AIC cable insertion (36 ensayos: seeds 100, 101 y tableros de entrenamiento):

| Modelo | Seed 100 | Seed 101 | Tableros de entrenamiento | Total (36 ensayos) | Inserciones | Ensayos < 15 pts |
|---|---|---|---|---|---|---|
| Recap round 2, 20k (este modelo) | 393 | 409 | 427 | 1229 | 2 completas | 2 |
| Recap round 1 (`xvla-recap-v1`) | 368 | 348 | 447 | 1163 | 2 completas | 5 |
| X-VLA (`xvla-aic-v4`) | 327 | 364 | 361 | 1052 | 2 completas + 1 parcial | 7 |
| Recap round 2, 40k (`xvla-recap-v2`) | 291 | 321 | 337 | 949 | 0 | 7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; la métrica reportada es específica de la tarea de inserción de cables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 879,7 M parámetros, los pesos en fp32 ocupan aproximadamente 3,5 GB y en fp16 unos 1,8 GB, a lo que hay que sumar el estado del runtime y los búferes de las tres cámaras.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos 8 GB de VRAM debería alojar los pesos en fp16, pero no hay validación publicada.
- Cabe en GPU de consumo: previsiblemente sí (el repo pesa 1,8 GB), aunque no se confirma en la información disponible.
- Opciones de despliegue: servidor SmolVLA del proyecto (`scripts/run_smolvla_server.sh`) sobre la librería LeRobot; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de control.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento AIC (36 ensayos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-VLA + Recap round 2, 20k (este) | 879,7 M | no disponible | 1229 | no disponible | Hugging Face |
| X-VLA + Recap round 1 (`xvla-recap-v1`) | no disponible | no disponible | 1163 | no disponible | Hugging Face |
| X-VLA (`xvla-aic-v4`) | no disponible | no disponible | 1052 | no disponible | Hugging Face |
| X-VLA + Recap round 2, 40k (`xvla-recap-v2`) | no disponible | no disponible | 949 | no disponible | Hugging Face |

No se dispone de comparación con VLA de otros autores (por ejemplo, π0 o SmolVLA) en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado exclusivamente para inserción de cables en el entorno AIC; no es un modelo generalista de robótica ni de lenguaje.
- Sobreentrenamiento documentado: el checkpoint de 40k pasos rinde peor (949 frente a 1229), por lo que usar más pasos no equivale a mejor política.
- Dependencia de contexto: requiere el sufijo `" Advantage: positive"` en la instrucción de tarea y el servidor del proyecto; fuera de ese pipeline el comportamiento no está garantizado.
- Sin licencia declarada: no se especifican términos de uso comercial, redistribución ni atribución; trátese como artefacto de investigación.
- Sin datos de sesgos, robustez fuera de distribución, latencia ni requisitos de hardware verificados.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: la política puede ejecutar trayectorias no validadas fuera de las condiciones de simulación vistas en entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por terceros.
- Idiomas y contexto no documentados; no debe asumirse soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muhammad-ibraheem/xvla-recap-v2-20k
- Dataset `aic-recap-v2`: https://huggingface.co/datasets/muhammad-ibraheem/aic-recap-v2
- Colección EEE 598 AIC cable insertion: https://huggingface.co/collections/muhammad-ibraheem/eee-598-aic-cable-insertion
- Código del proyecto: https://github.com/ibraheem-111/eee598-aic
- Checkpoint ronda 1: `xvla-recap-v1` (referenciado en la model card, sin URL directa disponible)
- Checkpoint base X-VLA: `xvla-aic-v4` (referenciado en la model card, sin URL directa disponible)
- Checkpoint 40k pasos: `xvla-recap-v2` (referenciado en la model card, sin URL directa disponible)
