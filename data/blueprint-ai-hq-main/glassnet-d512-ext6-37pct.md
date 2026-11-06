# blueprint-ai-hq-main/glassnet-d512-ext6-37pct

## Resumen

GlassNet es un modelo de lenguaje de investigación desarrollado por blueprint-ai-hq-main, publicado como checkpoint temprano con el identificador `glassnet-d512-ext6-37pct`. Se trata de un transformer decoder-only implementado íntegramente desde cero: tensores propios, retropropagación manual, optimizador propio y caché KV propia, sin PyTorch, sin librerías de autograd y sin pesos preentrenados. El modelo tiene 15.567.566 parámetros totales, una dimensión de modelo de 512, un vocabulario de 12.002 tokens y una ventana de contexto de 32 tokens.

El modelo no está pensado para producción ni para uso comercial general. El propio autor lo describe como un ejercicio de ingeniería reproducible: el interés no reside en su calidad lingüística, sino en la verificación numérica de los gradientes (error de 4,14e-09 frente a estimaciones numéricas), en un optimizador propio que supera a SGD en +4,3 puntos sobre 3 semillas, y en una caché KV 9,7 veces más rápida que el recálculo con salida idéntica.

Su relevancia es, por tanto, educativa y metodológica: sirve para estudiar cómo se construye, entrena, depura y mide un modelo pequeño sin framework, con métricas honestas y fallos documentados explícitamente. No es un candidato para despliegue, sino un artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only implementado desde cero (autograd manual, optimizador propio, KV cache propia) |
| Parametros totales | 15.567.566 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Blueprint AI License 1.0 (BAL-1.0); no aprobada por OSI |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GlassNet es un transformer decoder-only de dimensión 512, vocabulario de 12.002 tokens y ventana de 32 tokens, entrenado en float32 sobre una GTX 1660 SUPER con 6 GB de VRAM. La implementación es completamente artesanal: tensores, paso backward, optimizador y caché KV escritos desde cero, sin PyTorch ni ninguna librería de autograd. El checkpoint publicado corresponde a 6 épocas sobre el corpus completo con d=512.

El autor documenta varias innovaciones y hallazgos técnicos verificables. Los gradientes del motor están validados contra estimaciones numéricas con un error de 4,14e-09. El optimizador propio supera a SGD plano en +4,3 puntos sobre 3 semillas (23,46% frente a 19,14%). La caché KV es 9,7 veces más rápida que el recálculo con salida idéntica. Además, cada neurona intermedia lleva un nombre y las que fallan su auditoría se eliminan en lugar de suavizarse. Los experimentos de ablación son negativos: un bloque de atención de una sola cabeza perdió 5,41 puntos (18,69% frente a 24,10%), y la arquitectura propuesta por el autor perdió frente a la forma plana en ambas semillas (3,87% / 4,07% frente a 5,53% / 5,87%). No se especifica la composición del corpus de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto a nivel de token con gramática real pero contenido débil; el autor indica que no se ha logrado conversación coherente.
- Modelado de lenguaje autorregresivo con ventana de 32 tokens.
- Aritmética: 0,0% de exactitud en operandos no vistos según tres implementaciones; el análisis por dígito muestra una regla parcial en formación (el dígito 0 alcanza el 100% en operandos no vistos).
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- Multilingüe: solo inglés.
- No dispone de modo thinking, visión ni audio.
- Capacidad destacable de ingeniería: caché KV propia con salida idéntica al recálculo y 9,7 veces más rápida.

## Casos de uso

- Estudio de implementación desde cero: sirve para examinar cómo se escriben tensores, backward pass, optimizador y caché KV sin framework, con gradientes verificados numéricamente a 4,14e-09.
- Docencia de entrenamiento de modelos: el checkpoint permite reproducir curvas de accuracy en next-token sobre corpus completo y comparar configuraciones d=512 frente a d=256 con resultados medidos (37,37% frente a 35,26%).
- Validación de optimizadores: el autor documenta que su optimizador supera a SGD en +4,3 puntos sobre 3 semillas, lo que permite usar el modelo como banco de pruebas de variantes de optimización.
- Benchmark de caché KV: con una mejora de 9,7 veces frente al recálculo y salida idéntica, es útil para estudiar estrategias de decodificación incremental en modelos pequeños.
- Auditoría de neuronas interpretables: cada neurona intermedia lleva un nombre y las que fallan la auditoría se eliminan, lo que permite estudiar metodologías de interpretabilidad y poda selectiva.
- Reproducción de ablaciones negativas: los experimentos documentados (pérdida de 5,41 puntos con atención de una sola cabeza; pérdida de la arquitectura propuesta frente a la forma plana) sirven como material de estudio sobre diseño experimental y validación de hipótesis.
- Estudio de límites de contexto y vocabulario: con ventana de 32 tokens y vocabulario de 12.002, permite analizar el impacto de restricciones extremas en la calidad del modelado.

## Benchmarks y rendimiento

| Configuracion | Metrica | Resultado |
|---|---|---|
| d=512, corpus completo, 6 epocas | Exactitud next-token en held-out | 37,37% |
| d=256, corpus completo | Exactitud next-token en held-out | 35,26% |
| d=256, 2M ventanas | Exactitud next-token en held-out | 24,20% |
| Aritmetica en operandos no vistos | Exactitud exacta (3 implementaciones) | 0,0% |
| Ablacion de atencion de una sola cabeza | Exactitud | 18,69% (frente a 24,10% de referencia) |
| Arquitectura propuesta, semilla 1 | Exactitud | 3,87% (frente a 5,53% de la forma plana) |
| Arquitectura propuesta, semilla 2 | Exactitud | 4,07% (frente a 5,87% de la forma plana) |
| Optimizador propio frente a SGD | Diferencia en 3 semillas | +4,3 puntos (23,46% frente a 19,14%) |
| Cache KV frente a recalculo | Aceleracion con salida identica | 9,7x |
| Verificacion de gradientes | Error frente a estimacion numerica | 4,14e-09 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en float32 para los 15,5 millones de parámetros; el autor recomienda `--d 512` con 6 GB o más de VRAM y `--d 256` en caso contrario.
- GPU recomendadas: GTX 1660 SUPER (6 GB) es el hardware de entrenamiento documentado; cualquier GPU consumer con 6 GB o más es suficiente.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 6 GB o más de VRAM.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el modelo se distribuye como safetensors para uso con el código propio del repositorio.
- Latencia y throughput: no disponibles; la única métrica de rendimiento publicada es la aceleración de 9,7 veces de la caché KV frente al recálculo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlassNet d512 ext6 | 15,5 M | 32 tokens | From-scratch, sin framework, investigación | BAL-1.0 (no OSI) | Hugging Face, repo de 0,1 GB |
| GPT-2 small | 124 M | 1.024 tokens | Transformer preentrenado | MIT | Hugging Face |
| TinyLlama 1.1B | 1,1 B | 2.048 tokens | Transformer preentrenado con RLHF | Apache 2.0 | Hugging Face |

La comparación es orientativa por escala, no por rendimiento: GlassNet es dos órdenes de magnitud menor que GPT-2 small y su contexto es 32 veces más corto. No se dispone de benchmarks comunes que permitan una comparación directa de calidad.

## Limitaciones y advertencias

- No se ha logrado conversación coherente; la gramática es real pero el contenido es débil.
- Exactitud next-token de 37,37% en el mejor caso, insuficiente para cualquier tarea generativa práctica.
- Aritmética en operandos no vistos: 0,0% de exactitud exacta.
- Ventana de contexto de solo 32 tokens, lo que impide cualquier uso multi-turno o de documento largo.
- Solo soporta inglés.
- Licencia BAL-1.0 no aprobada por OSI: uso gratuito para individuos, estudiantes, investigación y uso no comercial; gratuito para organizaciones con ingresos anuales inferiores a 1.000.000 USD; por encima, se requiere licencia comercial con 1% de participación en ingresos.
- El uso dañino no está licenciado.
- El autor declara explícitamente fuera de alcance cualquier uso en producción, en sistemas de seguridad crítica o donde una respuesta errónea tenga coste económico o cause daño.
- Riesgo de alucinación elevado por la baja calidad del modelado; no apto para tareas donde la corrección factual sea requisito.
- No se documentan sesgos específicos, pero el corpus de entrenamiento no está descrito, lo que impide evaluar su composición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blueprint-ai-hq-main/glassnet-d512-ext6-37pct
- Licencia BAL-1.0: https://github.com/blueprint-ai-hq-git/glassnet/blob/main/LICENSE
- Repositorio del proyecto: https://github.com/blueprint-ai-hq-git/glassnet
