# CyberCraze/scenario-routed-policy-specialist-autonomous-driving

## Resumen

Scenario-routed policy specialist es un checkpoint de investigación derivado de TransFuser++, la política de conducción autónoma basada en aprendizaje por imitación desarrollada en el ecosistema CARLA. Lo publica el usuario CyberCraze como artefacto de un proyecto académico orientado a un caso límite muy concreto: la maniobra de cut-in (un vehículo que se inserta bruscamente en el carril propio). El modelo no pretende ser un agente de conducción general, sino un especialista en ese escenario, y el autor indica explícitamente que el rendimiento en conducción normal no se preserva.

El repositorio contiene el checkpoint original, el delta de ajuste fino de las cabezas de política, un escenario de simulación reproducible sobre CARLA 0.9.16 y los scripts de entrenamiento e inferencia. El objetivo declarado de éxito es evitar la colisión en el caso personalizado; detenerse es aceptable y no se exige completar la ruta. Según la evidencia registrada por el autor, la política original colisionó en 3 de 3 ejecuciones y la ajustada en 0 de 3, sobre un único caso de desarrollo seleccionado.

La relevancia práctica es metodológica más que de producto: ilustra un flujo completo de especialización de una política de conducción sobre un simulador, con separación entre datos (M1), entrenamiento y evaluación (M2) y artefactos versionados. No hay información pública sobre arquitectura interna, número de parámetros ni contexto, por lo que esta ficha se limita a lo verificable en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TransFuser++ (política de conducción sensorimotora; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones de simulación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación y scripts) |
| Licencia | other, con nombre declarado mixed-upstream-licenses y aviso de terceros en THIRD_PARTY_NOTICES.md |
| Formato de pesos | no disponible (repositorio PyTorch; tamaño total del repo 3,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de TransFuser++, una política de conducción para CARLA que combina información visual y de estado del vehículo para predecir acciones de control. El autor no detalla en la model card la configuración exacta de la red, el número de parámetros ni la composición de las entradas, por lo que esos datos deben considerarse no disponibles.

El procedimiento de ajuste fino se describe en dos fases: M1 descarga el conjunto StaticCutIn y prepara la partición de datos; M2 entrena únicamente las cabezas de política sobre el checkpoint original. El repositorio incluye tanto el checkpoint original como el delta resultante, lo que permite comparar ambas políticas con el mismo launcher. La innovación destacable no es arquitectónica sino de flujo de trabajo: un pipeline reproducible de especialización sobre un escenario límite, con simulación que espera a la inferencia del modelo y registro de colisiones y métricas por fotograma en el directorio `output/`.

## Capacidades

- Conducción autónoma en simulación CARLA 0.9.16, limitada al escenario de cut-in para el que fue ajustado.
- Comparación directa entre política original y política especializada mediante el launcher `M2/run_cutin_demo.ps1`.
- Ejecución de la simulación sincronizada con la inferencia del modelo (la simulación espera al modelo, no al revés).
- Registro de evidencia: resumen de colisiones y mediciones por fotograma en `output/`, con opción `-Record` para guardar imágenes de cámara.
- Entrenamiento reproducible de las cabezas de política sobre el checkpoint base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni multilingüismo.

## Casos de uso

- Investigación sobre escenarios límite en conducción autónoma: el modelo sirve como banco de pruebas para estudiar cómo una política preentrenada puede especializarse en una maniobra peligrosa concreta sin conservar el comportamiento general.
- Evaluación de estrategias de seguridad pasiva: dado que detenerse es una salida válida, el checkpoint permite medir cuánto de la evitación de colisión se logra mediante frenada conservadora frente a maniobras evasivas.
- Reproducción de experimentos académicos: el pipeline M1/M2 y los scripts en PowerShell permiten replicar el ajuste fino y la comparación en una máquina Windows con GPU NVIDIA y CARLA instalado.
- Docencia en simulación de conducción: el caso de cut-in es acotado y visual, lo que facilita demostrar el efecto del ajuste fino sobre una política base en un aula o laboratorio.
- Generación de datos sintéticos de colisión y no colisión: con `-Record` se pueden capturar secuencias de cámara etiquetadas por resultado, útiles para entrenar o validar detectores de riesgo.
- Estudio de degradación de capacidades: el autor advierte que el rendimiento en conducción normal no se preserva, lo que convierte al modelo en un caso útil para analizar olvido catastrófico en políticas sensorimotoras.
- Integración en pipelines de experimentación con Hugging Face Hub: el repositorio se descarga con `hf download` y se instala con un script de configuración que crea un entorno virtual aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evidencia cuantitativa es la comparación registrada por el autor en `M2/cutin_demo_results.json`:

| Política | Colisiones registradas | Ejecuciones |
|---|---|---|
| Original (checkpoint base) | 3 | 3 |
| Especialista (ajuste fino) | 0 | 3 |

El propio autor califica este resultado como un caso de desarrollo seleccionado, no como una evaluación exhaustiva.

## Requisitos de hardware

- GPU NVIDIA con driver funcional; el autor no especifica VRAM mínima ni modelo de GPU concreto.
- Sistema operativo Windows, con Python 3.12 y CARLA 0.9.16 UE4 para Windows extraído fuera del repositorio.
- El tamaño del repositorio es de 3,1 GB, lo que incluye checkpoints y delta de ajuste fino; el espacio en disco debe prever además el entorno virtual, los datos de StaticCutIn y las salidas de simulación.
- Despliegue mediante el launcher PowerShell incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput no disponibles; la simulación se ejecuta en modo síncrono esperando a la inferencia, lo que sugiere que el rendimiento depende del hardware y no se ha caracterizado públicamente.
- No se confirma que quepa en GPU de consumo; la ausencia de datos de parámetros impide estimar VRAM con rigor.

## Comparativa con modelos similares

| Modelo | Tipo | Escenario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scenario-routed policy specialist (este modelo) | Política TransFuser++ ajustada | Cut-in en CARLA 0.9.16 | no aplica | mixed-upstream-licenses | Hugging Face, repo de 3,1 GB |
| TransFuser++ original | Política de conducción en CARLA | Benchmark completo de conducción | no aplica | según distribución upstream | Referencia base del ecosistema CARLA |
| Otras políticas CARLA (p. ej. TCP, InterFuser) | Políticas sensorimotoras | Benchmark CARLA | no aplica | variable según proyecto | Repositorios académicos |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- El autor declara explícitamente que el rendimiento en conducción normal no se preserva; el modelo no debe usarse como agente de conducción general.
- La evidencia de éxito se basa en un único caso de desarrollo seleccionado y tres ejecuciones por política; no constituye una validación estadística.
- El repositorio está orientado a Windows con PowerShell y CARLA 0.9.16 UE4; no se documenta soporte para Linux ni para otras versiones del simulador.
- La licencia es mixta y remite a THIRD_PARTY_NOTICES.md; es obligatorio revisar y conservar los avisos de terceros antes de cualquier redistribución o uso comercial.
- No hay información sobre sesgos, tasas de alucinación ni robustez fuera del escenario de cut-in; en un modelo de política, el equivalente sería el comportamiento ante distribuciones de entrada no vistas.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no existe validación externa de la comunidad.
- No se especifican requisitos de VRAM, versiones exactas de dependencias más allá de Python 3.12 ni compatibilidad con GPU de consumo.
- El contenido del proyecto incluye una propuesta en PDF y LaTeX; conviene tratarla como material de investigación, no como documentación de producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyberCraze/scenario-routed-policy-specialist-autonomous-driving
- Aviso de licencias de terceros: https://huggingface.co/CyberCraze/scenario-routed-policy-specialist-autonomous-driving/blob/main/THIRD_PARTY_NOTICES.md
- Evidencia registrada de la demo: M2/cutin_demo_results.json (dentro del repositorio)
- Instrucciones de datos (M1): M1/README.md (dentro del repositorio)
- Instrucciones de entrenamiento y comparación (M2): M2/README.md (dentro del repositorio)
- Propuesta del proyecto: project_proposal.pdf y project_proposal.tex (dentro del repositorio)
