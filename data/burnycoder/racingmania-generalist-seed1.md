# BurnyCoder/racingmania-generalist-seed1

## Resumen

racingmania-generalist-seed1 es un agente de aprendizaje por refuerzo (PPO) desarrollado por BurnyCoder (Libor "Burny" Burian) como parte del proyecto de investigación RacingMania. Se trata de un piloto automatico para un videojuego de carreras 3D de tipo time-attack para navegador, construido con three.js y cannon-es (`RaycastVehicle`), y entrenado sobre un port en PyTorch de la misma fisica del coche. El modelo resuelve la tarea de conduccion autonoma en circuitos generados proceduralmente, optimizando el progreso sobre la linea central de la pista.

La arquitectura es deliberadamente ligera: una MLP de 2 capas de 256 unidades con activacion tanh, compartida por actor y critico, con dos cabezas de tres vias (una para direccion: izquierda/nada/derecha; otra para pedales: acelerar/derivar/frenar). La observacion combina el estado del coche con puntos de look-ahead sobre la pista. No es un modelo de lenguaje ni un transformer: es un agente de control de bajo nivel pensado para ejecutarse en tiempo real dentro de un navegador.

La relevancia de esta ficha es acotada pero clara: se publica como artefacto de investigacion reproducible de un proyecto abierto sobre RL aplicado a videojuegos. En el momento de la informacion disponible, el modelo figura en estado "planned": el registro, el codigo y la configuracion se subieron antes del entrenamiento, y aun no se ha registrado evaluacion ni configuracion de entrenamiento en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y critico), dos cabezas de 3 vias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: estado del coche + puntos de look-ahead) |
| Tipos de cuantizacion | no disponible (exportacion a ONNX; sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (agente de control, no modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | `final.pt` (checkpoint PyTorch) y `policy.onnx` (ONNX) |

## Arquitectura y entrenamiento

El agente sigue el algoritmo PPO (Proximal Policy Optimization) con una red ActorCritic de tipo MLP de dos capas de 256 unidades y activacion tanh. La politica produce dos decisiones discretas independientes mediante cabezas de tres vias: direccion (izquierda, ninguna, derecha) y pedales (acelerar, derivar, frenar). La observacion por defecto combina el estado del coche con puntos de look-ahead sobre la pista, con una ventana configurable (`window_k`). El objetivo de recompensa es el progreso sobre la linea central del circuito.

El entrenamiento se realiza sobre un pool de circuitos generado proceduralmente, con estados de inicio tanto desde parado como en posiciones aleatorias sobre la linea central. La model card indica que el modelo esta en estado "planned": el codigo y la configuracion se subieron antes del entrenamiento, y los campos de pasos de agente entrenados, horas de reloj, commit de git y configuracion de entrenamiento aparecen sin registrar. No se dispone de informacion sobre volumen de datos, composicion del dataset ni uso de tecnicas adicionales como RLHF o DPO (no aplicables en este contexto).

## Capacidades

- Control de conduccion en un simulador de carreras 3D: direccion y pedales discretos a partir del estado del coche y de puntos de look-ahead.
- Generalizacion a circuitos generados proceduralmente dentro del pool de entrenamiento.
- Inferencia en tiempo real en el navegador mediante el grafo ONNX (`policy.onnx`), que integra la funcion de observacion, el normalizador congelado y el actor.
- Ejecucion determinista (accion mas probable) o estocastica segun el modo de muestreo.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modos de razonamiento: es un agente de control de bajo nivel, no un modelo generativo de proposito general.

## Casos de uso

- Investigacion reproducible en RL: servir como semilla y punto de partida para comparar variantes de PPO, funciones de recompensa o arquitecturas en el mismo entorno de carreras.
- Demostracion interactiva en navegador: el `policy.onnx` se carga en el juego web ("Watch the AI") para visualizar el comportamiento del agente sin infraestructura de servidor.
- Benchmark de fisica y control: evaluar la transferencia entre el port en PyTorch de la fisica del coche y el motor cannon-es del juego.
- Generacion de datos sinteticos de conduccion: registrar trayectorias del agente para analisis de lineas de carrera o para inicializar otros agentes.
- Educacion y divulgacion: ejemplo didactico completo de un pipeline de RL (entorno, normalizacion, entrenamiento, exportacion a ONNX y despliegue web).
- Pruebas de robustez de controladores: someter al agente a variaciones de pista, estados iniciales o condiciones fisicas para estudiar su degradacion.

## Benchmarks y rendimiento

La model card define la metrica SWS (Success-weighted speed): media sobre pistas de terminadas x (tiempo del piloto scriptado / tiempo del agente), donde 1.0 equivale a completar todas las pistas tan rapido como el piloto de referencia. La evaluacion se realiza con una ejecucion determinista por pista desde parado e intervalos bootstrap del percentil 95 sobre pistas (una semilla).

Estado publicado: "Not evaluated yet". No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamano de la red (MLP 2x256) la inferencia es viable en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; cualquier GPU consumer es suficiente, y en la practica el modelo esta pensado para ejecutarse en el navegador.
- Cabe en GPU consumer: si, con margen amplio; tambien en CPU.
- Opciones de despliegue: ONNX Runtime (navegador o servidor) y PyTorch dentro del repositorio (`uv sync`, `racingmania.runs.load_policy`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (agentes RL para el juego RacingMania) con parametros, contexto, rendimiento y licencia documentados.

## Limitaciones y advertencias

- Estado "planned": el modelo se registro antes del entrenamiento; los campos de pasos entrenados, horas, commit y configuracion de entrenamiento no estan registrados, y la evaluacion no se ha realizado.
- Sin benchmarks publicados: no es posible afirmar su rendimiento real ni compararlo con alternativas.
- Dominio muy restringido: solo opera dentro del entorno RacingMania y su fisica version v1; no es transferible a otros simuladores sin reentrenamiento.
- Entrada de observacion fija: depende del formato de observacion del proyecto (`obs_size(k)`) y del normalizador congelado; cambios en la fisica o en la pista pueden degradar el comportamiento.
- Riesgo de sobreajuste al pool de circuitos de entrenamiento: la generalizacion a pistas fuera de la distribucion no esta evaluada.
- Sin capacidades linguisticas, de vision ni de tool calling; no debe emplearse como modelo generativo.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene conservar el aviso de copyright del autor.
- Alucinacion y sesgos: no aplican en el sentido habitual de modelos de lenguaje; el riesgo equivalente es un comportamiento de conduccion erroneo o inseguro en el simulador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/racingmania-generalist-seed1
- Repositorio del proyecto (codigo, paper y resultados): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Documentacion de formatos (`docs/formats.md`, seccion "Policy model"): incluida en el repositorio anterior
- Juego web (GitHub Pages): referenciado en el repositorio del proyecto
