# nvidia/SOMA-X

## Resumen

SOMA-X es un marco unificado de modelos paramétricos de cuerpo humano desarrollado por NVIDIA. Su principal innovación es desacoplar la representación de la identidad corporal de la parametrización de pose, de modo que diferentes modelos de identidad (SMPL, SMPL-X, MHR, ANNY, GarmentMeasurements y el propio SOMA-shape) se mapean a una topología canónica de cuerpo y manos. Esto permite compartir un único pipeline de Linear Blend Skinning (LBS) y de animación entre backends distintos, sin necesidad de reentrenar ni de realizar retargeting manual.

La arquitectura es fundamentalmente analítica y paramétrica: los módulos centrales son de forma cerrada y no contienen parámetros aprendidos. Un MLP superficial opcional puede añadirse para aplicar correctivos dependientes de la pose. La versión publicada es SOMA-X v0.3.0, con licencia Apache 2.0 y apta para uso comercial. El modelo está pensado para investigadores y profesionales de visión por computador, gráficos, animación y robótica.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Analítica/paramétrica: transferencia de malla baricéntrica + ajuste de esqueleto RBF + LBS; MLP opcional de correctivos de pose |
| Parámetros totales | Núcleo analítico: 0 parámetros aprendidos; PCA SOMA-shape: ~3,1 x 10^6 coeficientes preajustados; MLP opcional: ~1 x 10^8 parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (coeficientes PCA y pesos de MLP en PyTorch; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El núcleo de SOMA-X no emplea redes neuronales entrenadas con gradientes. Su pipeline se compone de tres módulos analíticos: la transferencia de malla baricéntrica, que usa una matriz dispersa de correspondencias precomputada por backend y se ejecuta como un producto matriz-vector en tiempo O(V_h); el ajuste de esqueleto mediante regresión con funciones de base radial (RBF) y alineación de rotación Kabsch, que produce los transforms de las 77 articulaciones en una única resolución lineal por identidad; y el Linear Blend Skinning estándar con parametrización de orientación relativa a la pose T, acelerado con kernels personalizados de NVIDIA Warp y compatible con `torch.export`.

La capa de cuerpo completo admite seis backends de identidad: SOMA-shape, SMPL, SMPL-X, MHR, ANNY y GarmentMeasurements. La versión v0.3 también incorpora capas de mano izquierda y derecha locales, con identidad SOMA nativa, prior de articulación muestreado e interoperabilidad con modelos MANO suministrados por el usuario. El espacio de forma de SOMA-shape se obtiene mediante análisis de componentes principales (PCA) ajustado de forma offline a partir de datos de escaneo corporal; no se reporta entrenamiento con gradientes para el pipeline central. El MLP opcional de correctivos dependientes de pose, de aproximadamente 100 millones de parámetros, se activaría si se desea reducir artefactos de superficie.

## Capacidades

- Estimación de pose y reconstrucción humana: interfaz de pose unificada que permite sustituir la identidad entre backends sin reentrenar.
- Generación de movimiento y animación: aplica secuencias de captura de movimiento a cualquier modelo de identidad soportado usando la misma parametrización axis-angle.
- Síntesis de avatares y humanos digitales: mezcla libremente fuentes de identidad con la representación de pose de SOMA.
- Simulación y robótica: forward pass analítico ligero, apto para pipelines de simulación en tiempo real con diversos tipos corporales.
- Animación y reconstrucción de manos: capas de mano izquierda/derecha en coordenadas locales de muñeca, con tres niveles de detalle (mid, low, extra-low) y prior de articulación.
- Diferenciabilidad total: la representación es diferenciable y está acelerada por GPU, lo que permite integrarla en pipelines de optimización basados en gradientes.
- Interoperabilidad entre modelos: soporta SMPL, SMPL-X, MHR, ANNY y GarmentMeasurements como backends de identidad.
- Niveles de detalle (LOD) configurables: mallas de salida de 18 056 vértices (mid), 4 505 (low) y 612 (extra-low), además de mallas de mano de 2 859, 718 y 134 vértices respectivamente.

## Casos de uso

- Estimación de pose humana en vídeo: el modelo recibe coeficientes de identidad y parámetros de pose y devuelve una malla posada en metros, lo que permite reconstruir la forma tridimensional de una persona en cada fotograma.
- Animación de personajes virtuales en producción: al unificar la topología de cuerpo y manos, un rig de animación creado para SOMA puede aplicarse sin cambios a cualquier backend de identidad, reduciendo retargeting manual.
- Aplicación de captura de movimiento: un clip de mocap con poses axis-angle puede proyectarse sobre SMPL, SMPL-X o SOMA-shape con el mismo código, acelerando el flujo de trabajo de estudios de animación.
- Simulación robótica y ergonómica: gracias al forward pass analítico de 2,1 ms por malla en GPU y 12,1 ms en CPU, el modelo puede integrarse en entornos de simulación para analizar interacciones humano-robot con distintas constituciones físicas.
- Generación de datasets sintéticos: la diferenciabilidad y la variedad de backends permiten producir grandes volúmenes de datos de cuerpos y manos con variaciones controladas de forma y pose, útiles para entrenar modelos de percepción.
- Avatares y humanos digitales en tiempo real: los distintos niveles de detalle permiten elegir la resolución de malla adecuada según la distancia de la cámara, optimizando el rendimiento en aplicaciones interactivas.
- Animación de manos para realidad virtual: las capas de mano locales, con soporte de modelos MANO, permiten generar gestos precisos con un prior de articulación que reduce posiciones implausibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no especificada por el autor. El repositorio ocupa 1,2 GB y los tensores de salida son de tamaño moderado dependiendo del LOD, por lo que se espera que funcione en GPUs de consumo, aunque no hay cifras oficiales.
- GPU recomendadas: NVIDIA A100 80GB para máximo throughput (más de 7 033 mallas posadas por segundo con batch 128). Cualquier GPU NVIDIA con soporte CUDA y NVIDIA Warp es adecuada para los kernels personalizados.
- Compatibilidad con consumer GPU: presumiblemente sí, dado el tamaño del modelo y la naturaleza analítica del pipeline, pero no se ha confirmado oficialmente.
- Opciones de despliegue: no es un modelo de lenguaje, por lo que no aplican vLLM, llama.cpp, Ollama ni TGI. Se despliega como biblioteca Python con PyTorch y aceleración mediante kernels NVIDIA Warp, con interfaz compatible con `torch.export`.
- Latencia y throughput reportados: 2,1 ms por malla en GPU (batch = 1), 12,1 ms en CPU de 32 núcleos, y > 7 033 mallas/s en A100 80GB con batch 128. El ajuste de esqueleto tarda menos de 1,68 ms por malla.

## Comparativa con modelos similares

SOMA-X no compite directamente con los modelos que unifica; actúa como capa de abstracción superior. La siguiente tabla resume su relación con las alternativas de la misma categoría:

| Modelo | Relación con SOMA-X |
|---|---|
| SMPL | Backend de identidad soportado. SOMA-X lo mapea a su topología canónica de cuerpo y esqueleto. |
| SMPL-X | Backend de identidad soportado. Incluye cara y manos; SOMA-X lo reparametriza en su esquema de 77 articulaciones. |
| MHR | Backend de identidad soportado. SOMA-X integra su representación de identidad mediante transferencia de malla y ajuste RBF. |
| ANNY | Backend de identidad soportado. Modelo antropométrico que cubre toda la vida humana, unificado en el pipeline de SOMA. |
| GarmentMeasurements | Backend de identidad soportado. Permite derivar la forma corporal a partir de medidas de prenda dentro del mismo marco. |

No se han publicado comparativas numéricas de precisión (p. ej. error de malla) entre SOMA-X y estos modelos en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo de lenguaje ni de texto; su entrada y salida son tensores geométricos.
- Los coeficientes de identidad deben mantenerse dentro del espacio de forma del backend correspondiente. Valores extremos fuera de distribución pueden producir geometría con artefactos.
- El modelo no incluye validación de sesgos en la información disponible. Al estar basado en datos de escaneo corporal, es probable que la cobertura de diferentes etnias, edades y constituciones sea desigual.
- La licencia Apache 2.0 permite uso comercial, pero los backends soportados (SMPL, SMPL-X, MHR, ANNY, MANO) pueden tener licencias propias. Es responsabilidad del usuario verificar las condiciones de cada backend antes de desplegar.
- El MLP opcional de correctivos dependientes de pose (~100 millones de parámetros) no está documentado en detalle en la model card; si se activa, su entrenamiento y uso pueden requerir recursos adicionales.
- No se han publicado benchmarks de precisión ni pruebas de robustez frente a datos extremos o parcialmente observados.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/SOMA-X
- GitHub: https://github.com/NVlabs/SOMA-X
