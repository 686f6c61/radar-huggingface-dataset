# arthurcs01/geotech-rl-qwen3-4b-sft-grpo

## Resumen

`geotech-rl-qwen3-4b-sft-grpo` es un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) sobre Qwen3-4B-Instruct-2507, desarrollado por arthurcs01 en el marco del proyecto geotech-rl. No es un modelo independiente: se aplica sobre el adaptador SFT `arthurcs01/geotech-rl-qwen3-4b-sft` ya fusionado con el modelo base. Su proposito es resolver episodios de un entorno sintetico de ingenieria geotecnica con formato y rutina de tarea aprendidos, no juicio de ingenieria real.

El adaptador tiene rango LoRA 16 y alpha 32 sobre las proyecciones de atencion y MLP, y se entreno durante solo seis pasos de un run previsto de veinte, que se estanco al alcanzar un nivel sin varianza de recompensa. El autor lo publica explicitamente para que los resultados del repositorio puedan inspeccionarse, con la advertencia de que todos los datos son sinteticos y no debe usarse para decisiones reales de cimentacion.

Es relevante ahora como ejemplo reproducible de un pipeline GRPO aplicado a un dominio tecnico vertical sobre un modelo pequeno (4B), con resultados medidos en episodios retenidos y con un analisis honesto de que parte de la mejora es formato y cual es aprendizaje real. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder Qwen3-4B-Instruct-2507 con SFT fusionado |
| Parametros totales | no disponible (adaptador LoRA de rango 16 sobre modelo base de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507 con el adaptador SFT `arthurcs01/geotech-rl-qwen3-4b-sft` fusionado previamente mediante `merge_and_unload()`. El entrenamiento usa GRPO con 64 rollouts por paso y grupos de 8, ejecutado en una unica RTX 5090 compartida entre inferencia y entrenador. El LoRA tiene rango 16, alpha 32, y afecta a las proyecciones de atencion y MLP. El stack es prime-rl y verifiers, con vLLM para la evaluacion.

El run se detuvo en el paso 6 de 20 porque las tareas servidas en orden alcanzaron un nivel sin varianza de recompensa; el adaptador publicado proviene de esos seis pasos. Los tensores son identicos a los del entrenamiento, pero sus nombres se convirtieron al formato de PEFT (prime-rl guarda otro formato) y `base_model_name_or_path` ya no apunta a una carpeta local. La receta de uso se verifico sobre la arquitectura real recortada a dos capas con pesos aleatorios, no sobre el modelo completo.

## Capacidades

- Generacion de texto en ingles orientada a tareas de ingenieria geotecnica sinteticas.
- Resolucion de episodios estructurados con formato de respuesta y rutina de tarea aprendidos (niveles N0 y N1 del entorno).
- Aplicacion de filtros y reglas presentes en las demostraciones (nivel N4, filtro de lluvia).
- Manejo de unidades de carga foraneas: no aprendido (0/24 en N2).
- Razonamiento sobre casos con collar agrietado: practicamente nulo (3/24 en N3, todos de control).
- Composicion de reglas no escritas (N5): no resuelto (0/24).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: ninguna declarada (sin vision, audio ni thinking mode documentado).

## Casos de uso

- Inspeccion y reproduccion de resultados de investigacion: cargar el adaptador sobre el SFT fusionado y ejecutar los episodios del entorno geotech-rl para verificar las cifras publicadas (24/24 en N0, N1 y N4; 0/24 en N2 y N5).
- Estudio de pipelines GRPO en dominios verticales: usar el repositorio como referencia de configuracion (64 rollouts, grupos de 8, LoRA r16/alpha 32) para experimentos con recompensas verificables.
- Analisis de fallos de formato en RL: el reward corrigio un error real (32% de episodios morian por un token erroneo al enviar), lo que sirve como caso de estudio de recompensas que arreglan formato sin ensenar juicio.
- Evaluacion de robustez ante varianza de recompensa: el run se estanco en el paso 6 al llegar a un nivel sin varianza, util como ejemplo de curriculo mal ordenado en entrenamiento por refuerzo.
- Docencia sobre limites de los datos sinteticos: el adaptador ilustra por que un 24/24 con 8 tareas y 3 intentos (intervalo de Wilson del 95%: 68-100% por tarea) no implica generalizacion.
- Pruebas de integracion PEFT: validar la receta de fusion en dos pasos (`merge_and_unload()` del SFT y luego carga del adaptador GRPO) frente a `AutoPeftModelForCausalLM`, que no funciona aqui porque `base_model_name_or_path` nombra un adaptador.

## Benchmarks y rendimiento

Episodios resueltos sobre instancias retenidas, segun la model card:

| Nivel | Que plantea | SFT | Este adaptador |
|---|---|---:|---:|
| N0 | calentamiento, metodo dado | 17/24 | 24/24 |
| N1 | calentamiento, metodo no dado | 18/24 | 24/24 |
| N2 | unidad de carga foranea | 0/24 | 0/24 |
| N3 | collar agrietado | 2/24 | 3/24 |
| N4 | ensayos saturados frente a secos | 15/24 | 24/24 |
| N5 | N2 + N3 + N4, sin regla escrita | no ejecutado | 0/24 |

Notas del autor: N0 y N1 no contienen decision y un script fijo los resuelve; los tres aciertos de N3 son instancias de control; N4 no es una decision aprendida porque las demostraciones contenian el filtro de lluvia. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el modelo base es de 4B parametros y el adaptador ocupa 0.1 GB, por lo que en bf16 el conjunto ronda los 8-9 GB, aunque esta cifra no la proporciona el autor.
- GPU recomendadas: el entrenamiento se ejecuto en una RTX 5090; no se documentan GPU de inferencia recomendadas.
- Cabe en GPU consumer: si, segun el hardware de entrenamiento empleado (RTX 5090), aunque no se detalla el consumo en inferencia.
- Opciones de despliegue: la evaluacion se hizo con vLLM; la receta de uso documentada es PEFT + transformers con `merge_and_unload()` en dos pasos. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| geotech-rl-qwen3-4b-sft-grpo | LoRA r16 sobre Qwen3-4B | no disponible | GRPO sobre dominio geotecnico sintetico | apache-2.0 | Hugging Face (adaptador) |
| geotech-rl-qwen3-4b-sft | LoRA sobre Qwen3-4B | no disponible | SFT sobre el mismo entorno | no disponible | Hugging Face (adaptador) |
| Qwen3-4B-Instruct-2507 | 4B | no disponible | Modelo base generalista de instrucciones | no disponible en la informacion | Hugging Face (Qwen) |

No se dispone de datos de benchmarks comparativos con otros adaptadores GRPO de dominio especifico en la informacion proporcionada.

## Limitaciones y advertencias

- No aplica directamente al modelo base: requiere fusionar primero el adaptador SFT; el snippet automatico de Hugging Face omite ese paso y falla.
- El autor declara explicitamente que el adaptador aprendio formato y rutina, no juicio de ingenieria.
- Todos los datos de entrenamiento son sinteticos; no debe usarse para decisiones reales de cimentacion.
- Entrenado solo seis pasos de veinte; el run se estanco por falta de varianza de recompensa.
- Un unico seed de entrenamiento; los intervalos de confianza son amplios (24/24 equivale a 68-100% por tarea con Wilson al 95%; 0/24 llega hasta el 32%).
- La mejora en N4 se atribuye a que las demostraciones contenian el filtro de lluvia, no a aprendizaje de la decision.
- Cero capacidad demostrada en unidades foraneas (N2) y en composicion de reglas no escritas (N5).
- Solo idioma ingles declarado.
- La receta de carga se verifico sobre una arquitectura recortada a dos capas con pesos aleatorios, no sobre el modelo completo.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en un modelo de 4B sobre dominio tecnico es esperable, pero no hay medicion publicada.
- Sesgos conocidos: no documentados.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/arthurcs01/geotech-rl-qwen3-4b-sft-grpo
- Adaptador SFT previo: https://huggingface.co/arthurcs01/geotech-rl-qwen3-4b-sft
- Repositorio del proyecto: https://github.com/arthurcunha51eng/geotech-rl
- DOI de cita (Zenodo): https://doi.org/10.5281/zenodo.23861866
