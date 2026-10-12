# kiroaiseoul/NAJY_act_all11_c100_gist30_drop_27D_60k_s3000

## Resumen

NAJY_act_all11_c100_gist30_drop_27D_60k_s3000 es un checkpoint de robótica basado en ACT (Action Chunking Transformer), la arquitectura de imitación por clonación de comportamiento implementada en la librería LeRobot de HuggingFace. Lo publica el usuario kiroaiseoul y corresponde al paso 60000 de un entrenamiento denominado internamente `t33_all11_c100_gist30_drop_60k_s3000`, realizado sobre datos del proyecto trossen-ai-simulation (variante mobile base). El modelo genera acciones de 16 dimensiones a partir de un estado proprioceptivo de 27 dimensiones y tres cámaras RGB de 480x640, por lo que su dominio es el control de un robot móvil con manipulador, no el procesamiento de lenguaje.

Con 51.700.368 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB, se trata de un modelo compacto pensado para inferencia en tiempo real sobre hardware de robótica. La model card aclara explícitamente que se sube con fines de análisis y puntuación, y que la confirmación como candidato para despliegue en robot real es una decisión independiente. Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el formato de checkpoints de políticas robóticas (observaciones multimodales más acciones) y facilita su reutilización con herramientas de evaluación y diagnóstico.

No se proporcionan datos de idiomas, benchmarks ni composición del dataset de entrenamiento en la información disponible, más allá de las dimensiones de entrada y salida y de un flag de aumento de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación de LeRobot |
| Parametros totales | 51.700.368 (aproximadamente 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica como ventana de tokens; entrada basada en observaciones de estado y visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, sin capacidades de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors); estructura `pretrained_model` de LeRobot |

Datos adicionales de la model card:

| Parametro | Valor |
|---|---|
| Run / paso | `t33_all11_c100_gist30_drop_60k_s3000`, step 60000 |
| Entrada `observation.state` | vector de 27 dimensiones |
| Entrada de imagen | `observation.images.cam_high`, `cam_left_wrist`, `cam_right_wrist`, cada una [3, 480, 640] |
| Salida `action` | vector de 16 dimensiones |
| Flag de aumento | `{"image_dropout": {"all": 0.3}}` |
| sha256 de model.safetensors | `ebb253f9d81f0ad09561017c8838c0ae6d49d465219cd151ac410bd0cdefd8a8` |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una política de imitación que predice bloques de acciones futuras (action chunking) en lugar de una única acción por paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La entrada combina un vector de estado proprioceptivo de 27 dimensiones con tres flujos de imagen de 480x640 (una cámara superior y dos muñecas izquierda y derecha), y la salida es un vector de acción de 16 dimensiones. El número de parámetros (51,7 M) es coherente con una política compacta de este tipo, con un encoder visual y un transformer de decodificación de acciones.

El checkpoint corresponde al paso 60000 de un entrenamiento identificado como `all11`, con `gist30` (probablemente destilación o compresión de representaciones, no confirmado) y `drop`, que se corresponde con el flag de aumento `image_dropout` de 0,3 aplicado a todas las cámaras. Este aumento desactiva aleatoriamente el 30 % de las imágenes durante el entrenamiento para mejorar la robustez ante fallos o pérdidas de cámara. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de refinamiento tipo RLHF o DPO (no aplicables habitualmente a políticas de imitación, pero no confirmado). La model card menciona como contexto el documento `docs/mobile_base_investigation.md` §94 del proyecto trossen-ai-simulation.

## Capacidades

- Generación de acciones robóticas de 16 dimensiones para control de un robot móvil con manipulador, condicionada por estado y visión.
- Percepción multimodal mediante tres cámaras RGB simultáneas (superior, muñeca izquierda, muñeca derecha) a resolución 480x640.
- Action chunking: predice secuencias de acciones en lugar de pasos aislados, lo que favorece la fluidez y reduce el error compuesto.
- Robustez parcial ante pérdida de imagen gracias al entrenamiento con `image_dropout` de 0,3 sobre todas las cámaras.
- Ejecución de tareas de imitación aprendidas de demostraciones (all11 sugiere once tareas o variantes, no confirmado).
- Integración directa con el ecosistema LeRobot y con herramientas de diagnóstico como `stage_cond_diag.py` o el lector de `multi_manifest.json`.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Manipulación robótica móvil en laboratorio: el checkpoint puede cargarse en LeRobot y ejecutarse sobre el robot objetivo para reproducir las tareas del entrenamiento `all11`, usando las tres cámaras como única fuente visual y el estado de 27 dimensiones como retroalimentación propioceptiva.
- Evaluación y puntuación de políticas: al estar subido explícitamente como material de análisis y scoring, sirve para comparar el desempeño del paso 60000 frente a otros checkpoints del mismo run mediante las herramientas de diagnóstico de LeRobot.
- Investigación en clonación de comportamiento: es útil como referencia reproducible de ACT con drop de imagen, para estudiar el impacto del `image_dropout` de 0,3 en la robustez ante oclusiones o fallos de cámara.
- Desarrollo de pipelines de simulación a real: partiendo del entorno trossen-ai-simulation, permite iterar políticas en simulación antes de trasladarlas a hardware real, tal como sugiere el documento de investigación citado en la model card.
- Reentrenamiento o ajuste fino: sus 51,7 M de parámetros y su formato safetensors estándar permiten usarlo como punto de partida para fine-tuning con nuevos datasets de demostraciones.
- Teleoperación asistida con autonomía parcial: puede integrarse en un bucle que combine comandos humanos con las predicciones de acción del modelo para tareas de pick-and-place o navegación con manipulación.
- Reproducibilidad y auditoría de experimentos: el hash sha256 publicado permite verificar la integridad del checkpoint antes de cualquier uso, algo crítico en entornos colaborativos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion ni comparaciones cuantitativas frente a otras politicas.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 207 MB en fp32 (51,7 M x 4 bytes) y unos 103 MB en fp16, sin contar el encoder visual ni las activaciones.
- Las activaciones de tres flujos de imagen a 480x640 y un batch de inferencia son el principal consumidor de memoria; el total real dependerá del backbone visual, que no se especifica (no disponible).
- Al ser un modelo de 51,7 M de parámetros, cabe con holgura en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090; no requiere GPU de centro de datos como A100 o H100 salvo por paralelización de experimentos.
- En robótica real, la inferencia suele ejecutarse sobre la propia GPU embebida del robot o sobre una estación conectada por red; el modelo es lo bastante pequeno para CPUs modernas con latencias mayores.
- Opciones de despliegue: LeRobot (carga nativa del formato `pretrained_model`), y exportación a otros runtimes segun las utilidades disponibles en el ecosistema; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; en ACT son dependientes del hardware y del horizonte de action chunking configurado.

## Comparativa con modelos similares

La informacion disponible no incluye datos cuantitativos de otros modelos comparables, por lo que los valores concretos se marcan como no disponibles.

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_gist30_drop_27D_60k_s3000 | ACT (LeRobot) | 51,7 M | 27D estado + 3 camaras 480x640 | apache-2.0 | HuggingFace |
| ACT (implementacion de referencia) | ACT | no disponible | no disponible | no disponible | repositorio original ACT / LeRobot |
| Diffusion Policy | política de difusion | no disponible | no disponible | no disponible | repositorio original |
| Otros checkpoints LeRobot de la misma categoria | ACT / políticas de imitación | no disponible | no disponible | variable | HuggingFace |

Como referencia cualitativa, ACT y Diffusion Policy son las dos familias de políticas de imitación más extendidas para manipulación, pero no se dispone de cifras verificables para esta comparativa.

## Limitaciones y advertencias

- La model card indica que el checkpoint se sube con fines de análisis y puntuación, y que la decisión de desplegarlo en un robot real es independiente y no está confirmada.
- Es un modelo específico para el robot y la configuración del entrenamiento `all11` del proyecto trossen-ai-simulation; no es transferible sin ajuste a otros robots, morfologías o distribuciones de cámara.
- No se documentan sesgos, pero una política de imitación hereda los sesgos y las limitaciones de las demostraciones con las que se entrenó (no disponibles).
- Riesgo de alucinación no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones incorrectas o inseguras ante situaciones fuera de distribución.
- La entrada visual fija a tres cámaras de 480x640 y un vector de estado de 27 dimensiones implica que cualquier cambio en la configuración de sensores invalida el modelo tal cual.
- El `image_dropout` de 0,3 mejora la robustez, pero no garantiza un comportamiento correcto si falla una cámara crítica en tiempo de ejecución.
- Licencia apache-2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y sin garantías; conviene revisar la licencia de los datos de entrenamiento subyacentes, que no se detalla.
- La fecha de creación y actualización del repositorio (2026-10-12) es posterior a la fecha actual, lo que puede indicar un error de metadatos o una fecha de sistema incorrecta; conviene verificarlo antes de citar el modelo.
- Antes de usar el checkpoint, se recomienda verificar el sha256 publicado frente al fichero descargado.

## Enlaces

- HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_drop_27D_60k_s3000
- Referencia citada en la model card: proyecto trossen-ai-simulation, documento `docs/mobile_base_investigation.md` §94 (no se ha encontrado URL directa en la busqueda web).
- Libreria de la que depende (LeRobot): https://github.com/huggingface/lerobot
- No se han encontrado en la busqueda web enlaces relevantes al modelo, al paper de ACT ni al proyecto trossen-ai-simulation; los resultados devueltos eran irrelevantes y no se incluyen.
