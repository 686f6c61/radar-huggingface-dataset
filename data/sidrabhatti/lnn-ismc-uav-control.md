# SidraBhatti/lnn-ismc-uav-control

# Ficha de modelo: LNN-ISMC para control de UAV multirotor

## Resumen
Este repositorio no aloja un modelo de lenguaje, sino el artefacto de investigación de un esquema de control para UAV multirotor: una red neuronal líquida (LNN) que actúa como estimador de perturbaciones e incertidumbre de modelo, integrada en un controlador de modo deslizante integral (ISMC). Lo firman Zainab Akhtar (autora principal, UET Lahore), Salman Ijaz (University of Nottingham Ningbo), Qadeer Ahmed (Ohio State University) y Sidra Ghayour Bhatti (rol supervisor), y se publicó en la American Control Conference (ACC) de 2026, pp. 4692-4697, con financiación de la Natural Science Foundation of China (proyecto 62250410367).

La arquitectura es una red líquida de una sola capa tipo reservoir con 32 neuronas recurrentes, donde cada neurona evoluciona según una EDO de primer orden con su propia constante de tiempo (τż = −z(t) + σ(W_in·x_in(t) + W_rec·z(t) + b)). La salida se lee como ζ̂_N(x,u) = W_out^T·z(t) y los pesos de lectura se adaptan en línea mediante una ley derivada de Lyapunov, no por retropropagación. El estimador se acopla a un observador tipo Luenberger aumentado y a una ley ISMC (u = u_eq + u_nl).

Su relevancia es doble: la model card lo presenta como la primera aplicación de redes neuronales líquidas a la estimación de incertidumbre y perturbación en un sistema dinámico no lineal, y los resultados en simulación rebajan el error cuadrático medio de posición frente a un esquema previo de observador neuronal de tiempo finito, tanto con viento (modelo de ráfagas Dryden) como sin él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal líquida (LNN) de una sola capa tipo reservoir, 32 neuronas recurrentes, cada una un sistema dinámico de primer orden (τż = −z(t) + σ(W_in·x_in(t) + W_rec·z(t) + b)); acoplada a un observador tipo Luenberger y a un controlador de modo deslizante integral |
| Parametros totales | no disponible (la model card no publica el recuento; especifica una única capa líquida con 32 neuronas recurrentes, con Γ = 0,03, τ = 0,01, b = 0,5) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible / no aplica (no se publican pesos ni formatos cuantizados) |
| Idiomas soportados | no disponible (la documentación está en inglés) |
| Licencia | other |
| Formato de pesos | no disponible (la model card no menciona artefactos de pesos ni checkpoints) |
| Tipo de artefacto | Repositorio de investigación asociado a una publicación (controlador y estimador, no un modelo generativo) |
| Dominio de aplicación | Control de actitud y posición de UAV multirotor (6-DOF: roll, pitch, yaw, x, y, z) |
| Versión / estado | Creado y actualizado el 12 de septiembre de 2026; 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento
El sistema tiene tres bloques. Primero, un observador de estado tipo Luenberger aumentado con la estimación de perturbación de la LNN: x̂̇(t) = Ax̂(t) + Bu(t) + g(x̂,t) + ζ̂_N(x̂,u) + L(y(t) − ŷ(t)). Segundo, la red líquida: una capa reservoir de 32 neuronas recurrentes cuya dinámica interna no es una activación estática sino una EDO con constante de tiempo propia, lo que la hace sensible a entradas no estacionarias. Tercero, el controlador ISMC, que combina un término de control equivalente (mantiene el sistema sobre la superficie deslizante usando la estimación de la LNN) y un término de conmutación discontinuo que rechaza la perturbación residual.

No hay entrenamiento por retropropagación ni un corpus de datos: los pesos de salida W_out se adaptan en línea mediante Ẇ_out = −Γ·z(t)·e_x^T·P, ley derivada de Lyapunov. El modelo del cuadricóptero es un 6-DOF estándar con velocidad residual de hélices Ω_r y un término combinado de incertidumbre y perturbación ζ_N(x,u) = Δg(x,u) + d(t) tratado como desconocido y estimado en línea, con la motivación práctica de no añadir sensores adicionales al UAV. Se aportan dos análisis de Lyapunov: uno para el error de observación y de pesos (V̇_x ≤ 0 bajo una desigualdad estándar sobre la ganancia L, con convergencia a cero del error de estado bajo excitación persistente) y otro para la superficie deslizante (V̇_y ≤ −η_y‖s(t)‖², con convergencia en tiempo finito al manifold).

## Capacidades
- Estimación en línea de perturbaciones externas e incertidumbre de modelo (término ζ_N) sin sensores adicionales a bordo.
- Seguimiento de actitud y posición de un cuadricóptero en simulación, sobre referencias sinusoidales y cosinusoidales.
- Rechazo de perturbaciones de viento modeladas con el modelo de ráfagas Dryden.
- Convergencia en tiempo finito a la superficie deslizante, con garantías de estabilidad demostradas analíticamente.
- Adaptación de pesos en línea apta para dinámicas no estacionarias, sin fase de entrenamiento previa con retropropagación.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo de pensamiento.

## Casos de uso
- Control de actitud de cuadricóptero en simulación: el esquema LNN-ISMC se emplea para seguir referencias de roll, pitch y yaw con error cuadrático medio de 0,006–0,009 en los ejes x e y, inferior al del observador neuronal de referencia.
- Rechazo de viento en vuelo estacionario o en trayectoria: con el modelo Dryden activo, el estimador mantiene MSE de posición de 0,009 (x), 0,021 (y) y 0,012 (z), lo que lo hace adecuado para validar robustez antes de pruebas de vuelo reales.
- Estimación de incertidumbre sin sensores extra: al tratar Δg(x,u) + d(t) como un término desconocido estimado en línea, permite prescindir de sensores adicionales de viento o de carga, reduciendo peso y coste del UAV.
- Banco de pruebas para observadores neuronales: sirve como referencia para comparar familias de estimadores (LSTM/GRU frente a redes líquidas) bajo el mismo escenario de simulación y las mismas métricas MSE.
- Investigación en control no lineal: la combinación de LNN con ISMC y los dos análisis de Lyapunov constituyen una base reproducible para extender el método a otros sistemas con dinámica inestable.
- Docencia y reproducción académica: la model card documenta masa (0,65 kg), inercia de rotor (6,0×10⁻⁵ kg·m²), longitud de brazo (0,26 m) e hiperparámetros, lo que facilita replicar el experimento.
- Integración futura en pilas de autopiloto embarcadas: aplicación potencial, no validada, dado que el trabajo se limita a simulación y no se han publicado pruebas en hardware.

## Benchmarks y rendimiento
Los datos disponibles son errores cuadráticos medios de estimación de posición (x, y, z) en simulación, no benchmarks de modelos de lenguaje ni de visión. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de artefacto.

| Método | Condición | MSE (x) | MSE (y) | MSE (z) |
|---|---|---|---|---|
| Esquema existente (observador neuronal de tiempo finito) | Sin perturbación | 0,015 | 0,022 | 0,013 |
| Esquema existente | Con perturbación | 0,028 | 0,033 | 0,0118 |
| LNN propuesta | Sin perturbación | 0,006 | 0,009 | 0,001 |
| LNN propuesta | Con perturbación | 0,009 | 0,021 | 0,012 |

La LNN mejora al esquema previo en todos los ejes y en ambas condiciones, con la excepción del eje z bajo perturbación, donde el resultado es prácticamente idéntico (0,012 frente a 0,0118). La model card atribuye a la propuesta una convergencia más rápida y un seguimiento preciso de ζ_N incluso con ruido de medida, aunque no se aportan cifras concretas de tiempo de convergencia.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible como dato publicado. La red tiene 32 neuronas recurrentes en una sola capa, por lo que el coste de cómputo es muy reducido y, por tamaño, podría ejecutarse en CPU. Esta afirmación es una estimación basada en el tamaño de la red, no un dato de la model card.
- GPU recomendadas: no disponibles. No se documenta ningún tipo de acelerador para los experimentos.
- Compatibilidad con GPU de consumo: no disponible. Ninguna GPU concreta (RTX 4090, A100, H100) aparece mencionada.
- Opciones de despliegue: no disponibles. Las herramientas habituales de servido de LLM (vLLM, llama.cpp, Ollama, TGI) no aplican a este artefacto, ya que no hay pesos publicados ni una interfaz de generación de texto.
- Latencia y throughput: no disponibles. La simulación se ejecuta a la frecuencia del lazo de control del cuadricóptero, pero no se publican cifras de tiempo de cómputo ni de frecuencia de control.

## Comparativa con modelos similares
No se conocen otros repositorios de HuggingFace directamente comparables en esta categoría. La comparación disponible es la que ofrece la propia publicación frente al esquema de referencia:

| Enfoque | Tipo | Parámetros publicados | Contexto | MSE con perturbación (x, y, z) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LNN-ISMC (propuesto) | Red líquida + ISMC + observador Luenberger | 32 neuronas, hiperparámetros Γ = 0,03, τ = 0,01, b = 0,5 | no aplica | 0,009 / 0,021 / 0,012 | other | Repositorio en HuggingFace, sin pesos publicados |
| Esquema existente (observador neuronal de tiempo finito) | Observador neuronal con control de tiempo finito | no disponible | no aplica | 0,028 / 0,033 / 0,0118 | no disponible | Solo descrito en la comparación de la publicación |
| Estimadores LSTM/GRU citados en la motivación | RNN con activaciones estáticas | no disponible | no aplica | no disponible | no disponible | Solo referencia cualitativa en la model card |

## Limitaciones y advertencias
- Validación exclusivamente en simulación: no hay pruebas en vuelo real ni en hardware embarcado, por lo que el comportamiento ante ruido de sensores reales, latencias o saturación de actuadores no está caracterizado.
- Sin pesos publicados: el repositorio no expone checkpoints ni artefactos reproducibles, de modo que la reproducibilidad depende de reimplementar el método a partir de la descripción.
- Licencia "other" sin texto explícito: no se aclaran las condiciones de uso comercial, redistribución o modificación, lo que supone un riesgo para integración en producto.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones asociadas.
- Mejora marginal en el eje z bajo perturbación: 0,012 frente a 0,0118 del esquema previo, es decir, sin ventaja en ese estado.
- Dependencia de hiperparámetros concretos (Γ = 0,03, τ = 0,01, b = 0,5, 32 neuronas) sin estudio de sensibilidad publicado en la información disponible.
- Escenario de simulación único: cuadricóptero de 0,65 kg, brazo de 0,26 m, trayectorias sinusoidales de 7 m de amplitud y altitud objetivo de 50 m con yaw nulo; no se demuestra generalización a otras plataformas, cargas o maniobras agresivas.
- Sin cobertura multilingüe ni de generación de texto: cualquier expectativa de uso como modelo de lenguaje, asistente o agente queda fuera del alcance del artefacto.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de estimación errónea de la perturbación en regímenes no cubiertos por el análisis de Lyapunov (por ejemplo, fuera de las condiciones de excitación persistente).

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/SidraBhatti/lnn-ismc-uav-control
- Publicación: Akhtar, Z., Ijaz, S., Ahmed, Q., & Bhatti, S.G. (2026). "Liquid Neural Network-Based Integral Sliding Mode Control of Multirotor UAV under Model Uncertainty and Disturbance." 2026 American Control Conference (ACC), New Orleans, Louisiana, USA, pp. 4692-4697. DOI: no disponible (la propia model card indica "paste once available").
- Financiación: Natural Science Foundation of China, proyecto 62250410367.
- Búsqueda web: los resultados recuperados no contienen ninguna referencia relevante al modelo (corresponden a foros de eBay y no guardan relación con el artefacto). No se dispone de papers, blogs, repositorios o demos adicionales.
