# macmacmacmac/CLEF-DualScreen

## Resumen

CLEF-DualScreen es un ajuste fino (fine-tune) de una cabeza de clasificacion denominada JointSchemaHead, compuesta por 121.762.820 parametros distribuidos en 122 tensores. No se trata de un modelo generativo completo, sino de una cabeza entrenada sobre los estados ocultos congelados del backbone CLEF-Flash LiteRT de Cloudflare. El autor es el usuario de Hugging Face macmacmacmac y el repositorio se publico el 4 de noviembre de 2026.

El modelo aborda dos tareas de seguridad en el contexto de agentes basados en LLM: el filtrado de salidas de herramientas (tool_output_filter) y la autorizacion de acciones (action_authorization_guard), orientadas a la deteccion de inyeccion de prompts. Se entrena exclusivamente la cabeza, manteniendo el backbone congelado, lo que reduce el coste computacional del ajuste.

Su relevancia actual radica en la creciente necesidad de mecanismos de defensa frente a ataques de prompt injection en sistemas agenticos. El repositorio raiz constituye un checkpoint LiteRT completo de CLEF, lo que facilita su despliegue en entornos con esa libreria. La evaluacion publicada es limitada y el propio autor advierte de que las cifras de desarrollo son ruidosas por el reducido tamano de las particiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza JointSchemaHead sobre backbone CLEF-Flash LiteRT congelado (transformer, detalles no disponibles) |
| Parametros totales | 121.762.820 (122 tensores, solo la cabeza entrenada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato LiteRT/TFLite) |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | LiteRT (TFLite); checkpoint LiteRT completo en la raiz del repositorio |

## Arquitectura y entrenamiento

La arquitectura consiste en una cabeza de clasificacion JointSchemaHead de 121.762.820 parametros y 122 tensores, montada sobre los estados ocultos congelados del backbone CLEF-Flash LiteRT de Cloudflare. Solo se entrena la cabeza; el backbone permanece fijo. El modelo resuelve dos tareas simultaneas: filtrado de salidas de herramientas y guardia de autorizacion de acciones.

El entrenamiento se ejecuto en un droplet de DigitalOcean denominado jev-retrain con una AMD Instinct MI355X, finalizando el 4 de noviembre de 2026 a las 21:36 UTC. Se empleo el protocolo AgentDojo original en su variante small, con 3 epocas, tamano de lote 16, tasa de aprendizaje 1e-4, pos_weight 3.0 y semilla 20261101. Los datos se componen de 569 filas de entrenamiento, 149 de desarrollo y 220 de test, combinando las tareas workspace y travel para entrenamiento y desarrollo, y banking y slack para test, con ambas tareas mezcladas. El checkpoint seleccionado es el de la epoca 3, elegido por AUC combinada en desarrollo. El proceso del droplet fue terminado por la desactivacion del alcance de la sesion SSH durante su propia fase de evaluacion de test, despues de completar el entrenamiento y guardar el checkpoint.

## Capacidades

- Clasificacion binaria para filtrado de salidas de herramientas (tool_output_filter), orientada a detectar contenido malicioso o inyectado en las respuestas de herramientas.
- Clasificacion binaria para autorizacion de acciones (action_authorization_guard), orientada a validar si una accion propuesta por el agente es legitima.
- Deteccion de inyeccion de prompts en el contexto de agentes LLM.
- Procesamiento en ingles (unico idioma declarado).
- Despliegue mediante LiteRT/TFLite, con pesos en ese formato.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, tool calling, agentes multi-paso ni modo thinking; se trata de un clasificador especializado.

## Casos de uso

- Filtrado de respuestas de herramientas en agentes LLM: el modelo clasifica la salida de una herramienta externa antes de que el agente la consuma, bloqueando contenido inyectado. Es adecuado por su tarea especifica de tool_output_filter.
- Guardia de autorizacion de acciones: antes de ejecutar una accion propuesta por el agente, el modelo puntua su legitimidad y permite bloquear acciones no autorizadas. Encaja con la tarea action_authorization_guard.
- Defensa en pipelines de agentes con protocolo AgentDojo: al haberse entrenado con ese protocolo, se integra en flujos que ya lo emplean.
- Despliegue en entornos con LiteRT: al distribuirse como checkpoint LiteRT completo, puede integrarse en aplicaciones que ya usan esa libreria en dispositivos o servidores.
- Monitorizacion de seguridad en produccion: como clasificador ligero de la cabeza (121,7 M de parametros) sobre un backbone congelado, permite evaluar cada interaccion con coste adicional reducido.
- Investigacion en defensas contra prompt injection: sirve como punto de partida o baseline para experimentos de filtrado y guardia en agentes.

## Benchmarks y rendimiento

| Split | tool_output_filter AUC | action_authorization_guard AUC |
|---|---|---|
| Dev epoca 0 (sin entrenar) | 0.9781 | 0.9704 |
| Dev epoca 3 (log de entrenamiento) | 0.9829 | 0.9846 |
| Test 220 filas (rescore local independiente en LiteRT) | 1.0000 | 0.7731 |

Detalle de la guardia en test (rescore local): TPR/FPR a 0,35 = 0,983/0,600; a 0,5 = 0,967/0,517; a 0,9 = 0,833/0,367. La tarea de guardia se degrada entre dominios (FPR a 0,5 en dev 0,089 frente a 0,517 en test), mientras que la de filtrado separa perfectamente en este test reducido. La estadistica de puntuacion coincide con el entrenamiento: filtro P("true"), guardia P("2") + 0,5*P("1"). El autor advierte de que las particiones de desarrollo son muy pequenas (filtro 65 filas, guardia 84 filas) y que las cifras deben tratarse como medidas ruidosas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del backbone CLEF-Flash y del formato LiteRT.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LiteRT/TFLite (formato de pesos del repositorio); vLLM, llama.cpp, Ollama y TGI no aplican a este formato de clasificador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores de seguridad para agentes sobre backbone CLEF-Flash).

## Limitaciones y advertencias

- Evaluacion ruidosa: las particiones de desarrollo son muy pequenas (65 y 84 filas) y el autor pide tratar las cifras como medidas de desarrollo con ruido.
- Degradacion entre dominios: la tarea de guardia colapsa en test (FPR a 0,5 de 0,517 frente a 0,089 en dev), lo que limita su fiabilidad fuera de los dominios de entrenamiento.
- Test reducido: la evaluacion de test consta de 220 filas y el resultado de filtrado perfecto (AUC 1,0000) procede de un rescore local pequeno, no de una replicacion de la cadena congelada.
- Sin replicacion de la cadena congelada: el autor indica que aun no existe replicacion del frozen-chain.
- Entrenamiento interrumpido: el proceso del droplet fue terminado durante la fase de evaluacion de test, por lo que las cifras de test no provienen del log del droplet.
- Idioma: solo ingles declarado; no se documenta soporte multilingue.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial requiere consultar la licencia del repositorio.
- Ambito limitado: es un clasificador de dos tareas, no un modelo generativo; no debe emplearse para generacion ni razonamiento general.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, especialmente en la tarea de guardia.

## Enlaces

- Hugging Face: https://huggingface.co/macmacmacmac/CLEF-DualScreen
