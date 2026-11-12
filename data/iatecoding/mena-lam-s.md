# iatecoding/Mena-LAM-s

## Resumen

Mena-LAM-s es un potencial interatómico entrenado con aprendizaje automático (machine-learned interatomic potential, MLIP) desarrollado por Francesco Viola dentro del proyecto independiente Mena-Lab, y publicado bajo el identificador `iatecoding/Mena-LAM-s` en Hugging Face. No es un modelo de lenguaje: su función es predecir energías, fuerzas, cargas parciales y dipolos de sistemas moleculares, lo que permite ejecutar simulaciones de dinámica molecular y calcular espectros vibracionales (IR y Raman) con precisión próxima a la de métodos de química cuántica pero a un coste computacional mucho menor.

El modelo se distribuye en un único fichero de pesos PyTorch (`mena-lam5-v1.pt`, 34,8 MB) y actúa como modelo molecular por defecto de la herramienta Mena-Lab, que se instala vía `pip` desde el repositorio GitHub del autor. Su relevancia radica en que cubre la tarea de potencial interatómico molecular con un tamaño muy reducido y una licencia permisiva (CC BY 4.0), lo que facilita su integración en flujos de trabajo de química computacional.

La información pública disponible es escasa: la model card no detalla la arquitectura interna, el número de parámetros, la longitud de contexto (concepto que en este dominio se traduce en el número máximo de átomos o el radio de corte) ni los detalles del proceso de entrenamiento más allá de la lista de conjuntos de datos utilizados. Los benchmarks reportados por el autor son dos: error en energía y fuerzas sobre el conjunto de validación de OMol25, y error en la energía de interacción proteína-ligando sobre PLF547.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (potencial interatómico con aprendizaje automático; no se especifica la familia: GNN, transformer equivariante, etc.) |
| Parametros totales | no disponible (el fichero de pesos ocupa 34,8 MB, lo que sugiere un modelo de tamaño reducido, pero no se indica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (en este dominio equivaldría al radio de corte y al número máximo de átomos tratables) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de química computacional, no procesa lenguaje natural) |
| Licencia | CC BY 4.0 para los pesos; Apache-2.0 para el código de Mena-Lab |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se trata de un potencial interatómico de tipo machine-learning force field (MLFF) que predice, para una configuración atómica dada, la energía total, las fuerzas sobre cada átomo, las cargas parciales y los momentos dipolares; a partir de estas magnitudes se derivan propiedades vibracionales como los espectros IR y Raman. El fichero distribuido es `mena-lam5-v1.pt`, de 34,8 MB, lo que sitúa el modelo en un rango de tamaño muy contenido para este tipo de potenciales.

El entrenamiento se realizó sobre una combinación de conjuntos de datos de química y materiales: OMol25, OMC25, OMat24, sAlex, MPtrj, MatPES, OC20, OC22, OpenRxn26 y SPICE 2. El autor indica que una publicación científica está en preparación y que, hasta entonces, debe citarse el repositorio de Mena-Lab. No se especifican el número de tokens o configuraciones de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de ajuste fino como RLHF o DPO (en este dominio no aplican del mismo modo, pero tampoco se detalla el esquema de entrenamiento supervisado).

## Capacidades

- Predicción de energías totales de sistemas moleculares.
- Predicción de fuerzas atómicas, lo que habilita dinámica molecular.
- Predicción de cargas parciales atómicas.
- Predicción de momentos dipolares.
- Cálculo de espectros vibracionales IR y Raman a partir de las magnitudes anteriores.
- Evaluación de interacciones proteína-ligando (benchmark PLF547).
- Integración como calculadora en Mena-Lab mediante `calculator("lam5-v1")`.
- Ejecución de puntos simples (`mena singlepoint water.xyz`) y de una interfaz web (`mena webapp`).
- No dispone de tool calling, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.

## Casos de uso

- Simulación de dinámica molecular de moléculas orgánicas: el modelo proporciona fuerzas y energías por configuración, lo que permite integrar las ecuaciones de movimiento y estudiar la evolución temporal de sistemas moleculares a un coste muy inferior al de la química cuántica de referencia.
- Predicción de espectros IR y Raman: a partir de las cargas parciales y dipolos predichos se pueden generar espectros vibracionales para comparar con datos experimentales o para asignar bandas en moléculas de interés.
- Cribado de interacciones proteína-ligando: el benchmark PLF547 sugiere que el modelo puede emplearse para estimar energías de interacción en complejos proteína-ligando, útil en etapas tempranas de descubrimiento de fármacos.
- Optimización de geometrías moleculares: las fuerzas predichas permiten relajar estructuras y refinar conformaciones antes de cálculos más costosos.
- Docencia y divulgación en química computacional: la instalación vía `pip` y la interfaz web de Mena-Lab facilitan demostraciones de dinámica molecular y espectroscopía sin infraestructura HPC.
- Integración en flujos de trabajo de materiales y catálisis: la inclusión de conjuntos como OC20, OC22 y OMat24 en el entrenamiento apunta a su uso en superficies y materiales, aunque la model card lo presenta explícitamente como potencial para moléculas.
- Prototipado rápido en pipelines de química computacional: el tamaño reducido de los pesos (34,8 MB) permite desplegarlo en entornos con recursos limitados.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| OMol25 (held-out) | Error en energía | 1,64 kcal/mol |
| OMol25 (held-out) | Error en fuerzas | 0,34 kcal/mol/Å |
| PLF547 (proteína-ligando) | Error en energía de interacción | 0,297 kcal/mol |

No se han publicado en la información disponible resultados comparativos con otros potenciales interatómicos (por ejemplo MACE, CHGNet o Orb) ni métricas adicionales como latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un fichero de pesos de 34,8 MB, el modelo cabe holgadamente en cualquier GPU de consumo actual, e incluso podría ejecutarse en CPU para sistemas pequeños.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de memoria es suficiente.
- Cabe en GPU de consumo: sí, con margen amplio, dado el reducido tamaño de los pesos.
- Opciones de despliegue: la vía oficial es Mena-Lab (`pip install "mena-lab @ git+https://github.com/iatecoding/mena-lab"`), con CLI (`mena singlepoint`) e interfaz web (`mena webapp`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros potenciales interatómicos de aprendizaje automático (MACE, CHGNet, Orb, NequIP, etc.), por lo que no es posible establecer una comparativa rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos, pero al ser un modelo entrenado sobre conjuntos concretos (OMol25, OMC25, OMat24, sAlex, MPtrj, MatPES, OC20, OC22, OpenRxn26, SPICE 2) su dominio de validez queda restringido a la química y los materiales representados en esos datos; fuera de ellos la fiabilidad no está garantizada.
- Riesgo de extrapolación incorrecta en configuraciones atómicas alejadas de la distribución de entrenamiento (moléculas grandes, elementos poco representados, condiciones extremas de presión o temperatura).
- No hay información sobre el radio de corte, el número máximo de átomos tratables ni el coste computacional por configuración, lo que dificulta planificar su uso en producción.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el autor pide citar expresamente los conjuntos de datos de entrenamiento y el repositorio Mena-Lab; hasta la publicación del paper, la cita recomendada es el repositorio.
- El proyecto es independiente y desarrollado por una sola persona con recursos propios, lo que implica un riesgo de mantenimiento y soporte a tener en cuenta en entornos de producción.
- El repositorio de Hugging Face muestra 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repo de 0,0 GB, lo que sugiere que los pesos podrían descargarse desde otra ubicación o que la métrica no refleja el contenido real.
- La fecha de creación indicada (2026-11-11) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del recurso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iatecoding/Mena-LAM-s
- Repositorio de Mena-Lab: https://github.com/iatecoding/mena-lab
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Conjuntos de datos citados en el entrenamiento (referencias a citar): OMol25, OMC25, OMat24, sAlex, MPtrj, MatPES, OC20, OC22, OpenRxn26, SPICE 2 (no se proporcionan enlaces directos en la información disponible).
- Paper: en preparación según el autor; no disponible todavía.
