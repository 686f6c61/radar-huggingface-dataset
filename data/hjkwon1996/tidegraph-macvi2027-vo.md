# hjkwon1996/TideGraph-MaCVi2027-VO

## Resumen

TideGraph-MaCVi2027-VO es un repositorio de artefactos de evaluación publicado por el equipo UW-IPL (University of Washington) para la edición 2027 del desafío MaCVi de odometría visual marítima. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado de forma general: contiene un regresor de velocidad basado en HistGradientBoosting (scikit-learn 1.7.2) ajustado exclusivamente sobre los 68 clips oficiales de entrenamiento, junto con las señales estimadas (rotaciones de ventana Omega, velocidad y rumbo) que sustentan la entrada reportada con un 10,83 % en dicho desafío.

El repositorio tiene un tamaño de 0,0 GB y cero descargas y likes en el momento de la consulta, lo que indica que se publicó como material de verificación para los organizadores del reto y no como un modelo listo para uso general. La model card es explícita: la reproducción es "cached reproduction", es decir, se pueden replicar exactamente las estimaciones y el JSON de entrada, pero no se ejecuta un pipeline completo desde los fotogramas de vídeo originales, ya que el modo vídeo sigue empleando velocidad retenida, rumbo por infrarrojos y estimaciones iniciales de calado.

La relevancia es por tanto acotada al ámbito de la investigación en odometría visual marítima y a la reproducibilidad de resultados de competición. No hay arquitectura transformer, ni parámetros en el sentido habitual, ni ventana de contexto: la ficha que sigue adapta la estructura solicitada a la naturaleza real del artefacto, indicando "no disponible" en todo aquello que la información proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresor de velocidad HistGradientBoosting (scikit-learn 1.7.2); grafo de yaw y trayectorias derivadas de rotaciones Omega (VGGT-Omega como modelo ascendente) |
| Parametros totales | no disponible (modelo tabular de gradient boosting, sin recuento de parámetros publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados; el artefacto es un pickle de scikit-learn) |
| Idiomas soportados | en (metadatos del repositorio; el artefacto no procesa lenguaje) |
| Licencia | no disponible (la model card indica que no se relicencia material de terceros y que los metadatos LOOKOUT conservan CC BY-NC 4.0) |
| Formato de pesos | `.pkl` (pickle de scikit-learn) y `.zip` con señales estimadas; `ARTIFACT_MANIFEST.json` con hashes |

## Arquitectura y entrenamiento

El componente entrenado es `models/flow_speed_v3.pkl`, un regresor de velocidad basado en HistGradientBoosting de scikit-learn 1.7.2, ajustado únicamente sobre los 68 clips oficiales de entrenamiento del reto. Se trata de un modelo tabular de boosting sobre histogramas, no de una red neuronal profunda, y no se documentan en la información disponible el número de árboles, la profundidad, la tasa de aprendizaje ni el conjunto exacto de características de entrada.

El resto del sistema es un pipeline de odometría visual: las rotaciones estimadas en ventanas Omega (procedentes del modelo ascendente VGGT-Omega) se combinan con señales de velocidad y rumbo para reconstruir un grafo de yaw y las trayectorias correspondientes. La model card subraya que los archivos publicados son estimaciones y no trayectorias de referencia ground-truth, y que la reproducción es en caché: el código emparejado reproduce exactamente el JSON de entrada y permite reconstruir el grafo de yaw, pero el modo vídeo sigue dependiendo de velocidad retenida, rumbo por infrarrojos y estimaciones iniciales de calado. No se documentan en la información proporcionada detalles sobre RLHF, DPO ni composición del dataset más allá de los 68 clips de entrenamiento.

## Capacidades

- Regresión de velocidad marítima a partir de características derivadas de los clips de entrenamiento oficiales.
- Reconstrucción del grafo de yaw y de trayectorias a partir de rotaciones estimadas en ventanas Omega.
- Reproducción exacta del JSON de entrada reportado (entrada 19406) mediante el código emparejado.
- Replay de las señales estimadas de velocidad y rumbo incluidas en `artifacts/estimated_signals_entry19406.zip`.
- Verificación de integridad mediante `ARTIFACT_MANIFEST.json`, que incluye hashes de archivos y el hash esperado del JSON de entrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo thinking: es un artefacto de odometría visual específico de dominio.

## Casos de uso

- Verificación por parte de los organizadores de MaCVi 2027: el repositorio permite comprobar que la entrada 19406 con 10,83 % se reproduce exactamente a partir de los artefactos publicados, sin necesidad de acceso a los datos originales.
- Reproducción de resultados en publicaciones: un investigador puede reejecutar el código emparejado para regenerar el JSON de entrada y el grafo de yaw, citando el artefacto como fuente reproducible.
- Auditoría de integridad de artefactos: el manifiesto con hashes permite comprobar que los archivos de estimación y del modelo no han sido alterados respecto a la versión fijada.
- Estudio de la contribución del regresor de velocidad: al estar ajustado solo sobre los 68 clips de entrenamiento, sirve para analizar cuánto aporta un modelo tabular de boosting frente a componentes más complejos del pipeline.
- Punto de partida para equipos participantes en futuras ediciones: el código y los artefactos documentan el límite entre reproducción en caché y pipeline completo desde vídeo, lo que ayuda a planificar qué partes reimplementar.
- Análisis de dominio marítimo con sensores heterogéneos: las señales retenidas (velocidad, rumbo por infrarrojos, calado inicial) ilustran una configuración de fusión de sensores para odometría en escenarios de marea, reutilizable como referencia metodológica.
- Docencia en robótica marina: el artefacto permite mostrar de forma concreta las diferencias entre estimación y ground-truth en trayectorias marítimas, así como los riesgos de evaluar sobre estimaciones cacheadas.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Entrada MaCVi 2027 Maritime Visual Odometry | 10,83 % | Resultado reportado por el equipo para la entrada 19406 |
| Reproduccion del JSON de entrada | Exacta | Tanto el replay de estimaciones como la reconstruccion del grafo de yaw reproducen el JSON suministrado |
| Cobertura del pipeline | Parcial | Reproduccion en cache; el modo video usa velocidad retenida, rumbo IR y calado inicial |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el componente entrenado es un modelo tabular de scikit-learn que se ejecuta en CPU y no requiere GPU para la inferencia del regresor.
- GPU recomendadas: no disponible para el regresor; el pipeline completo depende de VGGT-Omega, cuyos requisitos deben consultarse en su fuente original, ya que no se replica en este repositorio.
- Compatibilidad con GPU de consumo: el regresor cabe holgadamente en cualquier equipo; el pipeline ascendente con VGGT-Omega no está caracterizado en la información disponible.
- Opciones de despliegue: carga del pickle con scikit-learn 1.7.2 en Python; el código emparejado del repositorio de GitHub para el replay y la reconstrucción del grafo de yaw. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Datos de entrenamiento | Resultado reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TideGraph-MaCVi2027-VO (UW-IPL) | Regresor HistGradientBoosting + grafo de yaw sobre rotaciones Omega | 68 clips TRAIN oficiales | 10,83 % en MaCVi 2027 | no disponible (material de terceros con CC BY-NC 4.0 en metadatos LOOKOUT) | Repositorio público sin login; checkpoint VGGT-Omega no replicado |
| Otras entradas de MaCVi 2027 | no disponible | no disponible | no disponible | no disponible | no disponible |
| VGGT-Omega | Modelo ascendente de estimación visual | no disponible en esta información | no disponible | condiciones propias del autor original | Fuera de este repositorio |

No se dispone en la información proporcionada de otros artefactos comparables de la misma edición del reto ni de resultados de los mismos, por lo que la comparativa cuantitativa queda limitada al dato del 10,83 % reportado por este equipo.

## Limitaciones y advertencias

- Los archivos publicados son estimaciones, no trayectorias de referencia ground-truth; no deben usarse como verdad de referencia en evaluaciones.
- La reproducción es en caché: no se verifica un pipeline completo desde los fotogramas de vídeo originales. El modo vídeo sigue dependiendo de velocidad retenida, rumbo por infrarrojos y estimaciones iniciales de calado.
- El pickle (`models/flow_speed_v3.pkl`) solo debe cargarse desde una fuente de confianza, tal como advierte la propia model card.
- No se redistribuyen vídeo original, trayectorias de referencia TRAIN/VAL, referencia TEST, tokens de acceso ni checkpoints preentrenados externos; VGGT-Omega debe obtenerse por sus cauces originales y bajo sus propios términos.
- Los metadatos y materiales derivados de LOOKOUT conservan los términos CC BY-NC 4.0 aplicables, lo que restringe el uso comercial de esos materiales.
- No se concede licencia global sobre modelos externos ni se relicencia material de terceros; la licencia del propio repositorio figura como no disponible.
- El alcance es exclusivamente de dominio marítimo y odometría visual; no es un modelo de lenguaje y no ofrece generación de texto, código, razonamiento general ni capacidades multilingües.
- El resultado del 10,83 % corresponde a una única entrada de competición y no está acompañado en la información disponible de intervalos de confianza, ablaciones ni evaluación en otros conjuntos.
- El repositorio presenta cero descargas y cero likes en el momento de la consulta, sin validación externa conocida más allá de la verificación de los organizadores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hjkwon1996/TideGraph-MaCVi2027-VO
- Código del equipo: https://github.com/heejaeee/TideGraph-MaCVi2027-VO
- Contacto del líder del equipo: hkwon4@uw.edu (HeeJae Kwon, UW-IPL, University of Washington)
- Modelo ascendente VGGT-Omega: no disponible en la información proporcionada; debe obtenerse por sus fuentes originales y bajo sus propios términos
- Conjunto LOOKOUT (metadatos y materiales derivados, CC BY-NC 4.0): no disponible enlace directo en la información proporcionada
- Desafío MaCVi 2027 Maritime Visual Odometry: no disponible enlace directo en la información proporcionada
