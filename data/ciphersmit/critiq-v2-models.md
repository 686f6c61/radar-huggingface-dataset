# CipherSmit/critiq-v2-models

## Resumen

CritiQ v2 models es un conjunto de cuatro artefactos de aprendizaje automatico publicados por el usuario CipherSmit en Hugging Face, concebidos como el nucleo de CritiQ v2, un sistema de priorizacion de E/S de disco aprendido y organizado en siete niveles. No es un modelo de lenguaje: se trata de modelos tabulares entrenados sobre caracteristicas extraidas de trazas de bloques, con el objetivo de clasificar actores de E/S, generar una huella de carga de trabajo y asignar prioridades de planificacion. El proyecto corresponde a un trabajo de fin de grado del SIT Tumakuru (rama ISE, curso 2025-26) y se entrena en Google Colab a partir de un repositorio de datos privado, `CipherSmit/critiq-v2-data`.

El repositorio agrupa tres componentes funcionales y una ablation. La carpeta `rf/` contiene un Random Forest de scikit-learn que actua en el nivel 2 asignando clase de actor a partir de 12 caracteristicas. La carpeta `vae/` incluye un beta-VAE con espacio latente de 32 dimensiones y una cabecera auxiliar de prediccion de P99, que ocupa el nivel 3 y produce la huella de carga de trabajo junto con puntuaciones fuera de distribucion. La carpeta `mlp/` aloja una politica MLP con topologia 38→64→32→4 que en el nivel 5 emite una prioridad P0-P3 por actor. La carpeta `vae_plain/` replica la arquitectura del beta-VAE con β = 0 y sin perdida auxiliar, y solo sirve como ablation.

El entrenamiento es secuencial: primero el Random Forest, despues el beta-VAE (cuya entrada incorpora la mezcla de clases predicha por el bosque) y finalmente el MLP (cuya entrada incluye la clase del Random Forest, su confianza y la huella del VAE). Su relevancia es acotada y muy especifica: constituye un banco de pruebas reproducible para investigacion en planificacion de E/S guiada por aprendizaje, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Suite heterogenea: Random Forest (scikit-learn), beta-VAE con latente de 32 dimensiones mas cabecera auxiliar P99, beta-VAE de ablation (β = 0, sin perdida auxiliar) y MLP de politica 38→64→32→4 |
| Parametros totales | Random Forest y beta-VAE: no disponible. MLP: 4.708, cifra derivada de su topologia declarada (38x64 + 64 + 64x32 + 32 + 32x4 + 4, sesgos incluidos) |
| Parametros activos | no aplica (no es una arquitectura de mezcla de expertos) |
| Longitud de contexto | no aplica (entrada tabular de vector fijo: 12 caracteristicas en el RF, 60 en el VAE, 38 en el MLP) |
| Tipos de cuantizacion | no disponible (no se documenta cuantizacion de los artefactos) |
| Idiomas soportados | no aplica (modelos tabulares sobre trazas de E/S; la entrada es numerica) |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | skops para el Random Forest; safetensors mas JSON para el beta-VAE, la ablation y el MLP |
| ID en Hugging Face | CipherSmit/critiq-v2-models |
| Autor | CipherSmit |
| Libreria | pytorch |
| Pipeline declarado | tabular-classification |
| Etiquetas | pytorch, storage, io-scheduling, random-forest, beta-vae, tabular-classification |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-01 |
| Ultima actualizacion | 2026-10-01 |

## Arquitectura y entrenamiento

El sistema se organiza en tres etapas encadenadas. La primera es un Random Forest entrenado con etiquetas procedentes de un mapa proceso→clase construido manualmente sobre trazas FIU; su funcion es clasificar cada actor de E/S a partir de 12 caracteristicas. La segunda es un beta-VAE que recibe un vector de 60 dimensiones, lo comprime a un espacio latente de 32 y dispone de una cabecera auxiliar que predice el percentil 99 de latencia; su entrada incorpora la mezcla de clases estimada por el bosque, de modo que el fingerprint refleja tanto la forma de la carga como su composicion por tipo de actor. La tercera es un MLP de politica con capas 38→64→32→4 que consume la clase del bosque, la confianza de este y la huella del VAE, y devuelve una prioridad discreta entre P0 y P3 para cada actor. La carpeta `vae_plain/` reproduce la misma arquitectura del VAE con β = 0 y sin perdida auxiliar, y se declara explicitamente como ablation.

No se documentan en la informacion disponible el numero de tokens de entrenamiento (concepto no aplicable a datos tabulares), la composicion exacta de los conjuntos de trazas, ni el uso de tecnicas de alineacion como RLHF o DPO, que no tienen sentido en este dominio. Las arquitecturas concretas y el orden de las caracteristicas residen en `critiq-colab/critiq_models/` del repositorio del proyecto. La innovacion tecnica destacable es la cascada de dependencias entre componentes (las predicciones de una etapa alimentan la siguiente) y la combinacion de una cabeza de reconstruccion con una cabeza auxiliar de cola de latencia. Las etiquetas de prioridad no provienen de un sistema real, sino de la simulacion contrafactual de un planificador BFQ aproximado. Toda la formacion se ejecuta en Google Colab y el servicio se presta desde un Space de CritiQ.

## Capacidades

- Clasificacion de actores de E/S en clases discretas a partir de 12 caracteristicas tabulares (componente `rf/`, nivel 2 del sistema).
- Generacion de una huella de carga de trabajo en un espacio latente de 32 dimensiones y emision de puntuaciones fuera de distribucion (componente `vae/`, nivel 3).
- Prediccion auxiliar del percentil 99 de latencia mediante la cabecera auxiliar del beta-VAE.
- Asignacion de prioridad P0-P3 por actor mediante el MLP de politica de 38→64→32→4 (componente `mlp/`, nivel 5).
- Inferencia por lotes sobre conjuntos de actores: el Random Forest procesa 500 actores en 28,3510 ms segun la metrica declarada.
- Modo de ablation reproducible con el beta-VAE sin termino β y sin perdida auxiliar (componente `vae_plain/`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, capacidades de agente ni soporte multilingue.

## Casos de uso

- Simulacion trace-driven de planificadores de E/S: los tres componentes permiten reproducir una politica de priorizacion completa sobre trazas de MSR Cambridge, FIU y bloques de Alibaba, comparando el comportamiento aprendido con heuristicas clasicas como BFQ sin necesidad de acceso a hardware.
- Investigacion academica sobre planificacion aprendida: el repositorio separa claramente las etapas y expone las metricas del Random Forest, lo que facilita reproducir el pipeline y auditar cada nivel por separado.
- Prototipado rapido de heuristicas de priorizacion: el MLP de 4.708 parametros puede integrarse como modulo de decision dentro de un simulador existente y sustituirse por reglas manuales para medir la diferencia.
- Deteccion de cargas de trabajo anomalas o fuera de distribucion: las puntuaciones OOD del beta-VAE permiten marcar actores cuyo patron de acceso se aleja de las trazas de entrenamiento, util como senal de alarma en un banco de pruebas.
- Analisis exploratorio de trazas de bloques: el fingerprint latente de 32 dimensiones sirve para agrupar y visualizar regimenes de carga (lectura secuencial, escritura aleatoria, mezcla de procesos) sobre trazas FIU o MSR.
- Ablacion de componentes: `vae_plain/` permite cuantificar cuanto aporta el termino β y la perdida auxiliar P99 al rendimiento del fingerprint, manteniendo constante el resto del pipeline.
- Etiquetado asistido de trazas FIU: el Random Forest puede preetiquetar actores con clases coherentes con el mapa proceso→clase construido a mano, reduciendo el trabajo manual en experimentos posteriores.
- Docencia y proyectos finales de grado: al requerir solo CPU y entrenarse en Google Colab, la suite es viable como material practico de un curso de almacenamiento o de aprendizaje automatico aplicado a sistemas.

## Benchmarks y rendimiento

Unicamente se han publicado metricas para el componente `rf/`. Para `vae/`, `vae_plain/` y `mlp/` no se han publicado resultados de benchmarks en la informacion disponible.

| Metrica (componente `rf/`) | Valor |
|---|---|
| inference_ms_500_actors | 28,3510 ms |
| label_source | msr_behavior_rules |
| latency_critical_recall | 0,9997 |
| macro_f1 | 0,9999 |
| macro_f1_holdout_traces | 0,9999 |
| train_dataset | msr |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de cualquier otro benchmark de modelos de lenguaje, porque no son aplicables a esta familia de modelos tabulares. Tampoco se publican comparaciones contra planificadores de referencia ni curvas de latencia o throughput mas alla del dato de inferencia citado. A partir de ese unico dato puede derivarse una tasa de aproximadamente 17.600 actores por segundo, si bien se trata de una cifra calculada, no de una metrica declarada por el autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Por el tamano de los artefactos (Random Forest y MLP de 4.708 parametros; beta-VAE con vector de entrada de 60 dimensiones y latente de 32), el consumo es despreciable y en la practica inferior a 1 GB en cualquier configuracion.
- GPU recomendadas: no se requiere GPU. El Random Forest es un modelo de scikit-learn que se ejecuta en CPU. El entrenamiento de la suite se realizo en Google Colab, por lo que una GPU T4 o equivalente resulta suficiente para reentrenar.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo e incluso CPU exclusiva es suficiente. No se dispone de una estimacion de VRAM minima publicada.
- Opciones de despliegue: scikit-learn con formato skops para el Random Forest; PyTorch o safetensors para el beta-VAE, la ablation y el MLP; integracion en el Space de CritiQ para el servicio. vLLM, llama.cpp, Ollama y TGI no son aplicables a estos artefactos.
- Latencia y throughput: 28,3510 ms para 500 actores en el componente `rf/`, segun la metrica declarada. No hay datos de latencia para los componentes `vae/`, `vae_plain/` y `mlp/`.

## Comparativa con modelos similares

No se han encontrado en la busqueda web modelos publicos comparables de la misma categoria (clasificacion tabular aplicada a la planificacion de E/S de disco con esta estructura en cascada). Como referencia interna, se comparan entre si los cuatro artefactos del repositorio:

| Componente | Arquitectura | Entrada | Salida | Formato | Rol declarado | Metricas publicadas |
|---|---|---|---|---|---|---|
| `rf/` | Random Forest (scikit-learn) | 12 caracteristicas | Clase de actor | skops | Nivel 2 | macro_f1 0,9999; recall critico 0,9997; 28,3510 ms / 500 actores |
| `vae/` | beta-VAE, latente de 32 mas cabeza P99 | 60 caracteristicas (incluye mezcla de clases del RF) | Huella de carga y puntuaciones OOD | safetensors + JSON | Nivel 3 | no disponible |
| `vae_plain/` | beta-VAE con β = 0, sin perdida auxiliar | 60 caracteristicas | Huella de carga | safetensors + JSON | Ablation | no disponible |
| `mlp/` | MLP 38→64→32→4 | 38 caracteristicas (clase RF, confianza RF, huella VAE) | Prioridad P0-P3 | safetensors | Nivel 5 | no disponible |

## Limitaciones y advertencias

- Alcance restringido a investigacion: la propia model card indica que el uso previsto es la simulacion guiada por trazas y que el sistema no ha sido validado en sistemas en produccion.
- Etiquetas no observadas sino construidas: las clases del Random Forest provienen de un mapa proceso→clase elaborado a mano sobre FIU, y las prioridades de la simulacion contrafactual de un planificador BFQ aproximado. Existe riesgo de circularidad entre el etiquetado y el objetivo que se pretende medir.
- Dependencia de la fidelidad del simulador: los resultados son sensibles al grado de aproximacion del entorno de simulacion, tal como se reconoce en el informe de calibracion del proyecto.
- Valores de clasificacion sospechosamente altos: un macro_f1 de 0,9999 y un recall de 0,9997, identicos en el conjunto de retencion, sugieren una tarea con etiquetas poco ambiguas o posibles fugas de informacion, mas que una capacidad de generalizacion contrastada.
- Ausencia de metricas para la mayor parte de la suite: no hay resultados publicados de `vae/`, `vae_plain/` ni `mlp/`, de modo que la calidad de la huella latente y de la politica de prioridades no puede evaluarse con los datos disponibles.
- Repositorio de 0,0 GB y cero descargas: el tamano declarado sugiere que los pesos podrian no estar efectivamente alojados en el repositorio, por lo que la reproducibilidad practica no esta garantizada.
- Licencia `other` sin terminos concretos: no se especifican condiciones de uso comercial, redistribucion ni atribucion. Cualquier uso en produccion exige aclarar previamente la licencia con el autor.
- Sin capacidades linguisticas, multimodales ni de agentes: los campos de idiomas, contexto y tool calling no son aplicables y no deben asumirse en ninguna integracion.
- Correspondencia de nombres equivo ca: los resultados de busqueda web con la cadena "Critiq" (herramienta de revision de codigo, aplicacion de feedback y el modelo ModernBERT-CritiQ-V2) corresponden a proyectos homonimos sin relacion con este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CipherSmit/critiq-v2-models
- Repositorio de datos de entrenamiento (privado, citado en la model card): `CipherSmit/critiq-v2-data`
- Space de servicio (citado en la model card como "CritiQ Space", sin URL disponible)
- Codigo de arquitecturas y orden de caracteristicas (citado en la model card): `critiq-colab/critiq_models/` del repositorio del proyecto, sin URL disponible
- Informe de calibracion (citado en la model card): carpeta `research/` del repositorio del proyecto, sin URL disponible
- Resultados de busqueda web encontrados, todos ellos correspondientes a proyectos homonimos no relacionados: https://getcritiq.dev/docs/ai-providers/, https://getcritiq.dev/docs/, https://www.critiqueai.app/, https://huggingface.co/MidhunKanadan/ModernBERT-CritiQ-V2, https://github.com/faw21/critiq-vscode
