# GossetWorks/GR00T-N1.5-3B-Gosset-Orin8GB

## Resumen

GR00T-N1.5-3B-Gosset-Orin8GB es una distribución cuantizada a 8 bits del modelo vision-language-action (VLA) GR00T-N1.5-3B de NVIDIA, publicada por GossetWorks y empaquetada específicamente para su despliegue en dispositivos NVIDIA Jetson con 8 GB de memoria unificada (familia Orin). El modelo original es un VLA diseñado para control robótico generalista: recibe observaciones visuales e instrucciones en lenguaje natural y emite acciones motoras, lo que lo sitúa en la categoría de modelos que conectan percepción y actuación en robótica encarnada.

La ficha declara el tag `gr00t_n1_5`, el pipeline `robotics` y una relación de fine-tuning sobre `nvidia/GR00T-N1.5-3B`. El repositorio pesa 1,3 GB y los pesos en safetensors suman 609.351.294 parámetros, un dato que no coincide con el "3B" del nombre del modelo base: la discrepancia sugiere que el checkpoint publicado contiene únicamente un subconjunto de los módulos (por ejemplo, cabezas de acción o adaptadores) o que el empaquetado `gosset-packed` aplica una reestructuración de pesos. Esta inconsistencia debe verificarse antes de cualquier uso en producción.

Su relevancia es doble: por un lado, acerca un VLA de NVIDIA al hardware de borde (Jetson Orin de 8 GB) mediante cuantización de 8 bits, un escenario típico en robótica móvil y brazos colaborativos; por otro, es un modelo con acceso restringido, sin descargas y con documentación mínima, lo que lo convierte en un artefacto a evaluar con cautela y no en una dependencia estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language-action (VLA) basada en el modelo GR00T-N1.5 de NVIDIA; detalles internos no disponibles |
| Parametros totales | 609.351.294 (según safetensors del repo); el nombre del modelo base indica 3B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (tag `8-bit`); esquema concreto no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors (empaquetado `gosset-packed`) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna de esta distribución. El modelo base, `nvidia/GR00T-N1.5-3B`, pertenece a la familia GR00T de NVIDIA para robótica generalista, que combina un codificador visual, un modelo de lenguaje y una cabeza de acciones para producir trayectorias motoras a partir de instrucciones y observaciones. El tag `gr00t_n1_5` confirma la arquitectura de referencia, pero no se detallan el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento.

Tampoco se especifican los datos de entrenamiento, el número de tokens, ni si hubo etapas de RLHF, DPO o ajuste por imitación. El autor declara una relación de fine-tuning sobre el modelo base, pero no documenta qué datos adicionales se usaron ni qué módulos se ajustaron. La cuantización a 8 bits y el empaquetado propietario `gosset-packed` son las únicas transformaciones técnicas declaradas, y no hay información sobre el método de cuantización (GPTQ, AWQ, bitsandbytes u otro) ni sobre la pérdida de precisión resultante.

## Capacidades

- Generación de acciones motoras a partir de entradas visuales e instrucciones en lenguaje natural, propio de un modelo VLA.
- Procesamiento de observaciones visuales para control robótico (percepción integrada en el pipeline).
- Interpretación de comandos en lenguaje natural para traducirlos en secuencias de acción.
- Despliegue orientado a hardware de borde NVIDIA Jetson Orin de 8 GB, según el nombre del repositorio.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Control de brazos robóticos colaborativos en laboratorio: el modelo puede recibir imágenes de la escena e instrucciones textuales para generar trayectorias de agarre, aprovechando su naturaleza VLA y su empaquetado para 8 GB de memoria.
- Robótica móvil de borde: al estar orientado a Jetson Orin de 8 GB, encaja en plataformas embebidas donde no cabe el modelo completo en precisión nativa, permitiendo inferencia local sin conexión a la nube.
- Prototipado de políticas de manipulación: útil para experimentar con el paradigma VLA de NVIDIA en un equipo de investigación con hardware limitado, antes de escalar al modelo completo.
- Evaluación comparativa de cuantización: sirve para medir la degradación de rendimiento de un VLA al pasar a 8 bits en tareas de imitación, siempre que se disponga de un conjunto de validación propio.
- Integración en simuladores de robótica: el checkpoint puede cargarse en entornos como Isaac Sim para probar políticas antes de transferirlas a hardware real, aunque no se documenta compatibilidad explícita.
- Docencia y demostraciones: su tamaño de repositorio (1,3 GB) facilita su distribución en cursos sobre robótica encarnada y modelos VLA, con la salvedad del acceso restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1,3 GB y los pesos están cuantizados a 8 bits; para 609 millones de parámetros en 8 bits el peso ronda los 0,6 GB, pero el modelo base de 3B en 8 bits requeriría aproximadamente 3 GB solo en pesos. La cifra real depende de qué módulos contenga el checkpoint.
- GPU recomendadas: NVIDIA Jetson Orin de 8 GB (objetivo declarado); no se documentan requisitos para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada; el empaquetado propietario `gosset-packed` sugiere que no es un checkpoint estándar cargable directamente en llama.cpp u Ollama.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el pipeline declarado es `robotics` y el formato es safetensors empaquetado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GossetWorks/GR00T-N1.5-3B-Gosset-Orin8GB | 609 M (según safetensors) | no disponible | other (gated) | Hugging Face, acceso restringido | Cuantización 8-bit para Jetson Orin 8 GB |
| nvidia/GR00T-N1.5-3B | 3B (según nombre) | no disponible | no disponible | Hugging Face (modelo base) | Modelo original sin cuantizar |
| Alternativas VLA de código abierto (p. ej. OpenVLA) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es un modelo de descarga libre.
- Discrepancia de parámetros: el nombre indica 3B pero los safetensors declaran 609 M; hay que verificar qué contiene realmente el checkpoint antes de usarlo.
- Documentación mínima: no hay model card con detalles de entrenamiento, evaluación ni limitaciones, lo que impide validar su comportamiento.
- Cuantización a 8 bits: puede degradar la precisión de las políticas motoras respecto al modelo base; no se documenta la pérdida medida.
- Empaquetado propietario `gosset-packed`: probable incompatibilidad con toolchains estándar de inferencia, lo que complica su integración.
- Riesgo de alucinación: no evaluado; en modelos VLA se traduce en acciones inválidas o inseguras, con riesgo físico en robótica real.
- Licencia `other`: las condiciones concretas no están disponibles en la ficha; es imprescindible revisarlas antes de cualquier uso comercial.
- Sin datos de benchmarks ni de idiomas: no se puede afirmar su rendimiento ni su cobertura lingüística.
- Sin descargas ni validación comunitaria: solo 1 like y 0 descargas en el momento de la consulta, lo que indica ausencia de uso verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GossetWorks/GR00T-N1.5-3B-Gosset-Orin8GB
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
