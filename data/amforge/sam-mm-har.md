# AMFORGE/SAM-MM-HAR

## Resumen

SAM-MM-HAR es un modelo de reconocimiento de actividad humana (HAR, por sus siglas en ingles) multimodal desarrollado por AMFORGE Lab (AMEFORGE en Hugging Face). Clasifica 40 actividades cotidianas a partir de sensores no RGB que preservan la privacidad: profundidad, esqueleto, IMU, radar mmWave, infrarrojo y termico. El modelo se presento en el marco del CUHK-X Multimodal Human Activity Challenge, asociado a UbiComp 2026, y esta orientado a despliegue en el borde (edge AI).

La arquitectura es un Transformer disperso (sparse Transformer) propietario cuyos detalles internos no se han divulgado. Segun la model card, el modelo incorpora un componente denominado MotionCore, un modelo temporal del mundo basado en una GRU que opera sobre los embeddings por fotograma para capturar la dinamica del movimiento humano, lo que supone una ventaja frente a clasificadores convencionales que procesan cada fotograma de forma aislada.

El repositorio ocupa 0,2 GB y el modelo esta pensado para inferencia en CPU con un consumo de memoria inferior a 100 MB. La model card incluye marcadores de plantilla sin sustituir (por ejemplo, `{n_params:,}` o `{val_acc:.1f}%`), por lo que el numero exacto de parametros y la precision de validacion no estan disponibles. La licencia tampoco se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Transformer propietario (AMFORGE) con MotionCore (GRU temporal sobre embeddings por fotograma) |
| Parametros totales | no disponible (la model card contiene un marcador sin sustituir) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

SAM-MM-HAR emplea un Transformer disperso propietario cuyos detalles internos no se han publicado. Cada modalidad dispone de un codificador especifico: profundidad, IR y termico usan Patch Conv2D con atencion dispersa; el esqueleto usa una capa lineal sobre articulaciones con atencion dispersa; la IMU de 6 ejes usa Conv1D temporal; y el radar mmWave usa Patch Conv2D con atencion dispersa. Sobre las representaciones por fotograma se aplica MotionCore, una GRU que modela la dinamica temporal del movimiento a lo largo de la secuencia.

El modelo esta disenado para tolerar modalidades ausentes: cualquier subconjunto de sensores funciona en inferencia. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de una tarea de clasificacion supervisada, estos metodos no serian los habituales. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de 40 actividades diarias: higiene personal (lavarse la cara, cepillarse los dientes, lavarse las manos, peinarse), vestimenta y calzado, ingesta (beber agua, comer), lectura, escritura, uso de telefono y portatil, transiciones posturales (sentarse, levantarse, tumbarse, incorporarse), locomocion (caminar, correr, saltar), gestos (aplaudir, saludar, senalar, lanzar, patear), manipulacion de objetos (recoger, dejar, abrir/cerrar puertas, encender/apagar luces), tareas domesticas (barrer, pasar la aspiradora), caidas, consultar la hora y tomarse la temperatura corporal.
- Fusion multimodal con tolerancia a modalidades ausentes: cualquier subconjunto de Depth, Skeleton, IMU, mmWave, IR y Thermal es valido en inferencia.
- Modelado temporal del movimiento mediante MotionCore, que captura la dinamica entre fotogramas.
- Inferencia en CPU con menos de 100 MB de memoria, orientada a dispositivos de borde.
- Preservacion de la privacidad al no emplear sensores RGB.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card declara en y fr, aunque al ser un clasificador de actividades el papel del idioma es marginal.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Monitorizacion de personas mayores en el hogar: el modelo detecta caidas (`Fall_down`) y transiciones posturales a partir de sensores de profundidad, esqueleto o radar mmWave, sin camaras RGB, lo que reduce las objeciones de privacidad en dormitorios y banos.
- Cuidados asistidos en residencias: clasificacion de actividades de higiene y alimentacion para generar registros automaticos de actividad diaria y detectar patrones anomalos, usando IMU y esqueleto cuando no hay linea de vision.
- Domotica sensible al contexto: activacion de iluminacion o climatizacion segun actividades como `Turn_on/off_light`, `Sweep_floor` o `Vacuum`, aprovechando la tolerancia a modalidades ausentes para integrarse con los sensores ya instalados.
- Rehabilitacion y fisioterapia: seguimiento de ejercicios y gestos (`Wave`, `Point`, `Kick`, `Jump`) con esqueleto e IMU para cuantificar la adherencia y la calidad de la ejecucion.
- Deteccion de caidas en entornos industriales o de riesgo: el uso de radar mmWave e IR permite operar en condiciones de poca luz o con oclusion, donde una camara RGB fallaria.
- Investigacion en HAR multimodal: el modelo sirve como referencia para el reto CUHK-X y para experimentar con fusion de sensores y robustez ante modalidades faltantes.
- Despliegue en dispositivos de borde: al requerir menos de 100 MB en CPU, puede ejecutarse en gateways locales o equipos embebidos sin GPU, manteniendo los datos en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un campo de precision de validacion cruzada entre sujetos, pero aparece como marcador de plantilla sin sustituir (`{val_acc:.1f}%`), por lo que no se puede citar ninguna cifra.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo; la model card indica inferencia en CPU con menos de 100 MB de memoria.
- GPU recomendadas: no disponibles. El modelo esta disenado para CPU y edge; cualquier GPU moderna podria ejecutarlo, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible; el enfasis del autor es el despliegue en CPU.
- Opciones de despliegue: el repositorio proporciona `inference.py` y pesos en formato PyTorch (`best.pt`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un clasificador de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de HAR multimodal con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La model card contiene marcadores de plantilla sin sustituir (parametros, tamano en disco, precision de validacion), lo que impide verificar las cifras clave del modelo.
- La arquitectura es propietaria y sus detalles internos no se han divulgado, lo que dificulta la auditoria tecnica y la reproducibilidad.
- La licencia no esta especificada: no se puede confirmar si el uso comercial esta permitido.
- El modelo solo cubre 40 actividades predefinidas; no es un modelo generativo ni soporta instrucciones en lenguaje natural.
- El ambito linguistico declarado (en, fr) tiene relevancia limitada en una tarea de clasificacion de sensores.
- No hay datos publicados sobre sesgos por sujeto, edad, complexion o condiciones de captura; la validacion cruzada entre sujetos aparece sin cifra.
- Riesgo de confusion entre actividades visualmente o cinematicamente similares (por ejemplo, `Pick_up` frente a `Put_down`, o `Sit_down` frente a `Lie_down`), aunque no se cuantifica en la informacion disponible.
- El rendimiento con modalidades ausentes se declara como soportado, pero no se aportan metricas de degradacion.
- Al ser un modelo de clasificacion, no genera texto y no presenta riesgo de alucinacion en el sentido habitual; el riesgo principal es la clasificacion erronea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMFORGE/SAM-MM-HAR
- Reto CUHK-X Multimodal Human Activity Challenge (UbiComp 2026): no disponible (no se proporciona URL)
- Paper o publicacion tecnica: no disponible
- Repositorio de codigo adicional: no disponible (el repositorio de Hugging Face incluye `inference.py`)
