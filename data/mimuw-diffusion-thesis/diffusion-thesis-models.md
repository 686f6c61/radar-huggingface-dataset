# mimuw-diffusion-thesis/diffusion-thesis-models

## Resumen

`mimuw-diffusion-thesis/diffusion-thesis-models` es un repositorio de pesos de modelos de difusión publicados como material reproducible de la tesis de grado **Score-Based Diffusion Models: Theoretical Foundations and Optimal Sampling Schedules**, de Łukasz Leszko y Mateusz Scharmach (Universidad de Varsovia, Facultad de Matemáticas, Informática y Mecánica, 2026). No es un modelo de lenguaje ni un modelo generativo de propósito general: es una colección de checkpoints de investigación orientados a estudiar empíricamente el efecto del objetivo de predicción, del solver numérico y del proceso inverso en el muestreo de modelos de difusión.

El repositorio contiene cinco carpetas de experimentos: tres sobre MNIST y CIFAR-10 con arquitecturas EDM, una sobre datasets de patrones 2D sintéticos (Gaussian 8×8, 8×4, 6×6, Spiral5, Beehive) y una quinta con el checkpoint oficial de NVIDIA EDM2-S para ImageNet-64 como referencia externa. El tamaño total del repositorio es de 2,0 GB y los pesos están en formato PyTorch (`.pth` y `.pkl`).

Su relevancia es acotada y estrictamente académica: sirve como artefacto de reproducibilidad para quien quiera auditar los resultados de la tesis o reutilizar los modelos como banco de pruebas controlado para experimentos de schedulers de muestreo. No está pensado para despliegue en producción, no soporta texto ni instrucciones, y no dispone de pipeline declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes de difusión basadas en EDM (exp1–exp3) y EDM2 (referencia externa); sin arquitectura de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa PyTorch) |
| Idiomas soportados | no aplica (generación de imágenes) |
| Licencia | MIT para los checkpoints de la tesis; CC BY-NC-SA 4.0 para el checkpoint EDM2 de NVIDIA incluido en `edm2/` |
| Formato de pesos | PyTorch (`.pth` para los experimentos propios, `.pkl` para el checkpoint EDM2) |
| Tamano del repositorio | 2,0 GB |
| Libreria declarada | pytorch |
| Pipeline en Hugging Face | no disponible |

## Arquitectura y entrenamiento

Los experimentos 1, 2 y 3 emplean modelos de difusión de la familia EDM. El experimento 1 (MNIST) compara tres objetivos de predicción distintos —`noise`, `score` y `x0`— manteniendo el resto del setup constante. Los experimentos 2 y 3 (CIFAR-10) usan el modelo EDM medium y varían, respectivamente, el solver numérico y el proceso inverso de muestreo. El experimento 7 extiende el análisis a datasets de patrones 2D sintéticos de baja dimensionalidad (Gaussian 8×8, 8×4, 6×6, Spiral5, Beehive), útiles para visualizar trayectorias de muestreo y comparar schedulers sin el coste computacional de CIFAR-10.

Para cada experimento el repositorio publica tres tipos de ficheros: los pesos finales de inferencia (EMA), los pesos crudos (`raw_*`) y el estado de entrenamiento (`trainer_*`, con época, optimizador y scaler). Esta separación permite reanudar entrenamientos o auditar la evolución del modelo. No se documentan en la información disponible el número de tokens/imágenes de entrenamiento, la composición exacta de los datasets ni si hubo etapas de ajuste fino adicionales más allá del entrenamiento estándar de difusión. La carpeta `edm2/` contiene el checkpoint oficial EDM2-S de ImageNet-64 de NVIDIA (FID 1,58), incluido como referencia y no entrenado por los autores.

## Capacidades

- Generación de imágenes mediante muestreo de procesos de difusión inversa sobre MNIST, CIFAR-10 y patrones 2D sintéticos.
- Evaluación comparativa de objetivos de predicción (`noise`, `score`, `x0`) bajo una misma arquitectura.
- Evaluación comparativa de solvers numéricos y procesos inversos de muestreo con una red fija.
- Reproducción de experimentos académicos con estados de entrenamiento completos (`trainer_*`).
- Uso como referencia externa del checkpoint EDM2-S de NVIDIA para ImageNet-64.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni ninguna capacidad multimodal fuera de la generación de imágenes.

## Casos de uso

- **Reproducibilidad de la tesis**: descargar los checkpoints y ejecutar `main.py generate` con los mismos `--schedule`, `--equation`, `--solver` y `--n-steps` documentados para verificar las curvas y tablas del trabajo de Leszko y Scharmach.
- **Banco de pruebas de schedulers de muestreo**: usar los modelos de `exp2/` y `exp3/` como red fija sobre CIFAR-10 para comparar nuevos schedulers o solvers sin reentrenar, aislando el efecto del muestreo del de la arquitectura.
- **Estudio del objetivo de predicción**: emplear los tres checkpoints de `exp1/` (`noise`, `score`, `x0`) sobre MNIST para analizar cómo cambia la calidad de muestra y la estabilidad del entrenamiento según el target, con un coste computacional mínimo.
- **Docencia y visualización de difusión**: los datasets de patrones 2D de `exp7/` permiten trazar trayectorias de muestreo en dos dimensiones y explicar visualmente el efecto de distintos schedulers en un curso o tutorial.
- **Investigación sobre procesos inversos**: usar `exp3/` para comparar procesos inversos alternativos manteniendo red y dataset constantes, un escenario habitual en papers de muestreo acelerado.
- **Punto de partida para fine-tuning en dominios pequeños**: reutilizar los pesos EDM medium de CIFAR-10 como inicialización para experimentos con datasets de baja resolución y recursos limitados.
- **Referencia cruzada con EDM2**: emplear el checkpoint EDM2-S de `edm2/` como baseline externo (FID 1,58 en ImageNet-64) al comparar métodos propios, siempre respetando la licencia CC BY-NC-SA 4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona el FID 1,58 del checkpoint oficial EDM2-S de NVIDIA en ImageNet-64, que es un dato del modelo de referencia y no de los checkpoints de la tesis.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. Los modelos EDM medium de CIFAR-10 y los de MNIST son ligeros y caben holgadamente en GPUs de consumo; el checkpoint EDM2-S de ImageNet-64 es el más exigente del repositorio.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA para los experimentos de MNIST y patrones 2D; para CIFAR-10 y EDM2 se recomienda al menos una RTX 3090/4090 o superior (A100/H100 para barridos a gran escala).
- **GPU de consumo**: sí, los experimentos 1 y 7 caben en GPUs de consumo modestas; los experimentos 2, 3 y el checkpoint EDM2 requieren más memoria, aunque siguen siendo viables en una RTX 4090.
- **Opciones de despliegue**: el repositorio no está integrado en vLLM, llama.cpp, Ollama ni TGI (no son modelos de lenguaje). El flujo previsto es el código de la tesis (`uv run main.py generate`) sobre PyTorch, o cualquier framework de difusión compatible con checkpoints EDM/EDM2.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| diffusion-thesis-models (exp1–exp3, exp7) | Difusión EDM, MNIST/CIFAR-10/patrones 2D | no disponible | no aplica | No publicado en la información disponible | MIT | Hugging Face, repo de 2,0 GB |
| EDM2-S oficial (NVlabs) | Difusión EDM2, ImageNet-64 | no disponible en la información | no aplica | FID 1,58 en ImageNet-64 | CC BY-NC-SA 4.0 | Incluido en `edm2/`, repo oficial de NVlabs |
| EDM original (NVlabs) | Difusión EDM, CIFAR-10/ImageNet-64 | no disponible en la información | no aplica | No disponible en la información | CC BY-NC-SA 4.0 | Repo oficial de NVlabs |
| Modelos de difusión de propósito general (p. ej. Stable Diffusion) | Difusión latente texto-a-imagen | no disponible | no aplica | No comparable directamente | Varía según versión | Hugging Face |

La comparación con modelos de difusión de propósito general no es significativa: los checkpoints de este repositorio son artefactos de investigación sobre datasets de baja resolución, sin condicionamiento textual ni pipeline de inferencia estándar.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no procesa texto, no sigue instrucciones y no soporta tool calling, agentes ni razonamiento multi-paso.
- **Alcance muy restringido**: los checkpoints propios están entrenados en MNIST, CIFAR-10 y patrones 2D sintéticos; no generalizan a imágenes naturales de alta resolución.
- **Sin benchmarks publicados**: la model card no incluye FID, IS ni métricas comparativas de los experimentos 1, 2, 3 y 7, por lo que no es posible evaluar su calidad sin ejecutar el código de la tesis.
- **Licencia mixta**: los checkpoints de la tesis son MIT, pero el checkpoint EDM2 de `edm2/` está bajo CC BY-NC-SA 4.0, lo que restringe su uso a investigación no comercial; conviene no mezclar ambos en productos comerciales.
- **Riesgo de sesgo y alucinación**: en el contexto de generación de imágenes, los sesgos de los datasets de entrenamiento (MNIST, CIFAR-10) se trasladan a las muestras; no aplica el concepto de alucinación textual, pero sí el de artefactos visuales propios de modelos de difusión pequeños.
- **Sin soporte de la comunidad**: 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay issues, demos ni integraciones de terceros.
- **Dependencia del código de la tesis**: la carga de los pesos requiere el repositorio `github.com/leszkolukasz/diffusers`, que implementa las firmas de `main.py generate`; fuera de ese código, la compatibilidad con frameworks estándar no está garantizada.
- **Idiomas y contexto**: no aplica; son modelos de imagen sin ventana de contexto textual.

## Enlaces

- Hugging Face: https://huggingface.co/mimuw-diffusion-thesis/diffusion-thesis-models
- Código de la tesis: https://github.com/leszkolukasz/diffusers
- Repositorio oficial EDM2 (NVIDIA): https://github.com/NVlabs/edm2
- Referencia del checkpoint EDM2-S: `edm2/edm2-img64-s-1073741-0.075.pkl` (FID 1,58 en ImageNet-64)
