# rezapop/IDFF-code

## Resumen

IDFF (Implicit Dynamical Flow Fusion) es un método de modelado generativo desarrollado por Reza Rezaei (Universidad de Toronto) que combina conditional flow matching (CFM) con un término de score-Langevin y una difusión acoplada para mejorar la robustez del muestreo con pocas evaluaciones de red (NFE). El repositorio `rezapop/IDFF-code` es un espejo en Hugging Face de la release de código `v1.0.0` alojada en GitHub, y contiene la implementación de referencia descrita en el artículo publicado en TMLR (arXiv:2409.14599). No se trata de un modelo de lenguaje preentrenado con pesos listos para inferencia, sino de un framework de investigación con código, tests y ejemplos ejecutables en CPU.

La innovación central es entrenar una única red con dos cabezas (un denoiser y un score) y muestrear con un drift de CFM aumentado por un término de score-Langevin y correcciones de curvatura opcionales calculadas mediante JVPs de modo forward. Con K=1 el par score-Langevin preserva las marginales de CFM en tiempo continuo, lo que aporta robustez frente a discretizaciones gruesas; con K≥2 se añaden términos de curvatura a lo largo de la dirección del flujo sin necesidad de redes adicionales. El repositorio incluye ejemplos en 2D (8 gaussianas, checkerboard, moons), un surrogate de dinámica molecular (polyALA con 46 ángulos diedros) y el atractor de Lorenz.

Es relevante ahora porque propone una alternativa práctica a los samplers deterministas de flow matching en regímenes de muy bajo NFE, un escenario crítico en generación en tiempo real y en dominios científicos donde cada evaluación de red es costosa. El código está pensado para reproducibilidad: todo corre en CPU, los tests tardan unos 15 segundos y los resultados por presupuesto de NFE se escriben en CSV y gráficas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con dos cabezas (denoiser y score); MLP con embedding opcional de posición de secuencia; sampler Euler-Maruyama y autoregresivo |
| Parametros totales | no disponible (depende de la configuración; el ejemplo usa `JointHeadMLP` con `dim` configurable) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el ejemplo de series temporales usa ventanas configurables) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | no disponible en este repositorio (los checkpoints entrenados están en `rezapop/IDFF`) |

## Arquitectura y entrenamiento

IDFF entrena una sola red con dos salidas: un denoiser que predice x̂₁(x_t, t) y una cabeza de score ŝ_t(x_t, t). El muestreo combina el drift de conditional flow matching v̂_t = (x̂₁ − x_t)/(1 − t) con un término de score-Langevin γ_t¹ ŝ_t y, opcionalmente, términos de curvatura γ_t^k (∇^{k−1} ŝ_t)[u_t]^{k−1} calculados con JVPs de modo forward sobre la misma cabeza de score, donde u_t es la dirección normalizada del flujo. La difusión se acopla mediante g_t² = 2γ_t¹. El schedule por defecto de γ_t¹ es una Beta(2,2) escalada, 4γ̄ t(1 − t), y los coeficientes de curvatura siguen γ_t^k = α_k γ_t¹ Δt^{k−1}.

El repositorio incluye el acoplamiento OT opcional mediante el paquete `torchcfm` vendorizado (Tong et al., MIT), la pérdida IDFF con emparejamiento de pares para series temporales y utilidades de trayectorias. Los ejemplos cubren distribuciones 2D, un surrogate de dinámica molecular (polyALA, 46 ángulos diedros) y el atractor de Lorenz, con rollouts autoregresivos libres (5 trayectorias × 3 semillas) comparados contra la simulación de referencia. No se documentan en la información disponible el volumen de datos de entrenamiento ni el uso de RLHF/DPO, algo esperable al no ser un modelo de lenguaje.

## Capacidades

- Generación de muestras en distribuciones 2D arbitrarias (8 gaussianas, checkerboard, moons) con samplers CFM, Stochastic CFM e IDFF K=1/2/3.
- Modelado generativo de series temporales y sistemas dinámicos: surrogate de dinámica molecular (polyALA) y atractor de Lorenz.
- Muestreo con muy bajo NFE (desde 3 evaluaciones; a NFE=2 todos los samplers coinciden).
- Selección de hiperparámetros por presupuesto de NFE sobre datos de validación (γ̄ para K=1, α₂ para K=2).
- Acoplamiento OT opcional para el emparejamiento de ruido y datos.
- Sampler autoregresivo (Algoritmo 4) para rollouts de series temporales.
- No soporta tool calling, function calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye visión, audio ni modo thinking.

## Casos de uso

- Investigación en samplers de flow matching: comparar CFM determinista, Stochastic CFM e IDFF K=1/2/3 sobre la misma red entrenada para aislar el efecto del sampler en la calidad de muestra a presupuestos fijos de NFE.
- Generación rápida en dominios científicos: usar IDFF K=1 con 3-5 NFE como surrogate generativo de dinámica molecular (polyALA) cuando la simulación directa es costosa, aprovechando la robustez a la discretización gruesa.
- Modelado de sistemas caóticos: generar rollouts del atractor de Lorenz con el sampler autoregresivo para estudiar la fidelidad estadística de trayectorias generadas frente a la integración numérica.
- Prototipado de distribuciones sintéticas: validar nuevas variantes del método sobre los ejemplos 2D incluidos antes de escalar a datos reales, gracias a que todo corre en CPU en minutos.
- Reproducción de resultados de artículo: ejecutar los scripts de `2D_examples/` y `timeseris_example/` para regenerar las tablas y gráficas por presupuesto de NFE y verificar la teoría con los tests numéricos de `tests/test_idff.py`.
- Docencia y formación: usar el código como implementación de referencia didáctica de flow matching estocástico con correcciones de curvatura, con tests que validan numéricamente las afirmaciones teóricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio reporta comparaciones cualitativas y por presupuesto de NFE (calidad de muestra frente a NFE para 8 gaussianas, checkerboard y moons, y error de rollouts en polyALA y Lorenz), pero la información proporcionada no incluye cifras numéricas concretas de métricas estándar.

## Requisitos de hardware

- VRAM: no aplica para los ejemplos incluidos; el código corre en CPU (los tests tardan unos 15 segundos en un portátil).
- GPU: no se requiere GPU para los ejemplos 2D ni de series temporales; no se especifican GPU recomendadas para escalar a datos reales.
- Consumer GPU: sí, cualquier GPU con soporte PyTorch es suficiente para los ejemplos; no se documentan requisitos para configuraciones mayores.
- Despliegue: instalación vía `pip install -r requirements.txt` (torch, numpy, scipy, matplotlib y `pot` para el acoplamiento OT); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; los scripts de ejemplo tardan "unos minutos" en CPU según la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | NFE bajo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IDFF (este repositorio) | Framework generativo | CFM + score-Langevin + curvatura | Sí (desde 3) | other | Código en HF y GitHub; checkpoints en `rezapop/IDFF` |
| CFM determinista (Tong et al.) | Framework generativo | Conditional flow matching | Limitado | MIT (torchcfm vendorizado) | Incluido como baseline en este repositorio |
| Stochastic CFM | Framework generativo | CFM con ruido | Parcial (solo en presupuestos mínimos) | no disponible | Incluido como ablación en este repositorio |

No se dispone de datos de rendimiento numérico para una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni mantiene conversaciones; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Licencia "other": es imprescindible revisar los términos exactos antes de cualquier uso comercial; la model card no detalla condiciones.
- A NFE=2 todos los samplers coinciden (γ_t¹ se anula en t=0 y los coeficientes se desactivan en el paso final), por lo que IDFF solo aporta ventaja a partir de tres pasos.
- Con el α₂≈0.05 por defecto del artículo, el término K=2 es aproximadamente el 1% del término Langevin K=1 y no produce cambios visibles; los valores seleccionados en validación son mayores y en su mayoría negativos (α₂ ∈ [−4, −0.5]), y la teoría no fija el signo.
- Los hiperparámetros deben seleccionarse por presupuesto de NFE sobre datos de validación; un uso con valores por defecto puede no reproducir las mejoras reportadas.
- El repositorio es un espejo de código sin pesos en la release `v1.0.0`; los checkpoints entrenados están en `rezapop/IDFF` y no se detallan en la información disponible.
- No se documentan sesgos, riesgos de alucinación ni cobertura de idiomas por no tratarse de un modelo de texto; los riesgos se limitan a la fidelidad del modelo generativo en el dominio de aplicación.
- El tamaño del repo es de 0.0 GB, coherente con un release de código sin artefactos pesados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rezapop/IDFF-code
- Checkpoints y paper en Hugging Face: https://huggingface.co/rezapop/IDFF
- Artículo en arXiv: https://arxiv.org/abs/2409.14599
- Release de código en GitHub: https://github.com/MrRezaeiUofT/Implicit_Dynamical_Flow_Fusion_for_Genereative_Modeling/releases/tag/v1.0.0
