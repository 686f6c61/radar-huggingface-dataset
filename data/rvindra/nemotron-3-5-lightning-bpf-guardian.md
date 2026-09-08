# rvindra/nemotron-3.5-lightning-bpf-guardian

## Resumen

El modelo Nemotron-3.5-Lightning-30B BPF-Guardian es un adaptador PEFT LoRA sobre el modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B, desarrollado por el autor rvindra. Su propósito es especializar un modelo MoE híbrido Mamba-Transformer en la generación verificada de programas eBPF/XDP para Linux: código C que pasa el verificador del kernel y se ejecuta correctamente en fixtures de paquetes.

El problema que resuelve es la dificultad de escribir código eBPF/XDP válido a mano, dado que requiere cumplir restricciones estrictas del verificador del kernel. El modelo se entrena mediante SFT y RLVR (Reinforcement Learning from Verifier Rewards), usando un pipeline de validación de cuatro etapas con clang-18, bpftool y `BPF_PROG_TEST_RUN` en un kernel Linux 6.8.0. Según la tabla de rendimiento del autor, el adaptador RL logra un 62,3 % de aciertos en la suite combinada de 276 tareas, lo que supone un +25,6 % de mejora relativa respecto a la línea base anterior.

La arquitectura del modelo base es un Mixture-of-Experts de 30B parámetros con 3B activos, híbrida entre Mamba y Transformer, con predicción multi-token. El adaptador LoRA publica sus pesos en safetensors y está disponible en dos revisiones: `main` (SFT) y `rl-n3` (RL).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre MoE híbrido Mamba-Transformer (base: NVIDIA Nemotron 3.5 Lightning 30B-A3B) |
| Parámetros totales | 30B (modelo base) + LoRA (parámetros no especificados) |
| Parámetros activos | 3B (modelo base MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se publica en bfloat16; el modelo base admite cuantizaciones externas) |
| Idiomas soportados | inglés, código (eBPF/XDP/C) |
| Licencia | MIT (adaptador) / OpenMDW-1.1 (modelo base) |
| Formato de pesos | safetensors, PEFT LoRA |

Nota: el repositorio pesa 3,1 GB. No se ha especificado el número exacto de parámetros del adaptador LoRA.

## Arquitectura y entrenamiento

El modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B es un MoE híbrido de 30B parámetros totales con 3B activos, que combina bloques Mamba y Transformer e incorpora Multi-Token Prediction. Está diseñado para ejecución rápida de tareas en agentes de larga duración. Sobre este base, el adaptador BPF-Guardian añade un LoRA entrenado mediante SFT a partir del dataset `rvindra/bpf-guardian-sft`, que contiene 2.320 ejemplos (1.913 de entrenamiento y 407 de validación). Posteriormente, la revisión `rl-n3` aplica un entrenamiento de refuerzo con RLVR usando el dataset `rvindra/bpf-guardian-rl`, un benchmark certificado de 264 tareas.

La innovación principal es el pipeline de verificación en kernel: cada programa generado se somete a validación estructural, compilación con `clang-18 -target bpf -O2`, carga en el verificador del kernel mediante `bpftool prog load` y ejecución dinámica con `BPF_PROG_TEST_RUN`. Si el programa falla, el sistema extrae el diagnóstico de compilador o verificador y lo usa como feedback para un segundo turno de reparación. El modelo RL se optimiza para maximizar la probabilidad de pasar la verificación completa en un máximo de dos intentos (Solve@2).

## Capacidades

- Generación de código eBPF/XDP en C autónomo y autocontenido, sin dependencias externas.
- Verificación automática contra el verificador real del kernel de Linux 6.8.0-106-generic.
- Reparación interactiva en dos turnos: si el código generado no compila o no pasa el verificador, el modelo recibe el diagnóstico y genera una versión corregida.
- Soporte de cuatro dominios de programación de red: filtrado y seguridad de paquetes (DDoS, port knocking, token bucket, bloom filters), routing y forwarding (Maglev hashing, ECMP, LPM trie, proxy ARP, túneles), inspección y telemetría (Count-Min Sketch, análisis de RTT TCP) y transformación de paquetes (VLAN/QinQ, GTP-U/VXLAN, rewrites IPv4/IPv6).
- Salida optimizada para pasar `clang-18` con `-Wall -Werror` y el verificador del kernel.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no documentado; el modelo se centra en generación y reparación de código con feedback de verificador.
- Capacidades multilingües: limitadas a inglés y código; no se documenta soporte de otros idiomas.

## Casos de uso

- Defensa anti-DDoS en el kernel: el modelo puede generar un programa XDP que implementa un token bucket policer o un filtro de puertos para descartar tráfico malicioso, listo para cargar con `bpftool`.
- Balanceadores de carga con ECMP/Maglev: sintetiza código XDP con hashing consistente Maglev o enrutadores multipath ECMP, útil para infraestructuras de red de alto rendimiento.
- Telemetría de red a nivel de paquete: genera programas con Count-Min Sketch para detectar «heavy hitters» o medir RTT de flujos TCP, integrables en monitores de tráfico.
- Transformación de paquetes en redes overlay: crea código para decapsular GTP-U/VXLAN, manipular VLAN/QinQ o reescribir cabeceras IPv4/IPv6, adecuado para clústeres Kubernetes y redes definidas por software.
- Reparación automática de código eBPF en CI/CD: cuando un programa no pasa el verificador en un pipeline, el modelo usa el diagnóstico del compilador/verificador para producir una corrección en un segundo turno, reduciendo la intervención manual.
- Generación de políticas de seguridad de red: el modelo puede producir filtros XDP que inspeccionan direcciones IP de origen/destino y puertos, con verificación real de que el programa carga en el kernel.
- Prototipado educativo y de investigación en eBPF: sirve para generar ejemplos funcionales de XDP que sirven como punto de partida para estudiantes o investigadores sin escribir el boilerplate del verificador.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados en un VPS con kernel Linux 6.8.0-106-generic, usando `clang-18 -target bpf -O2` y verificadores reales del kernel (sin simulaciones). Los benchmarks miden el porcentaje de tareas completadas correctamente sobre el total de cada suite.

| Benchmark | Tamaño | Base Nemotron 30B | Prior Baseline (Qwen3-8B SFT v2) | BPF-Guardian SFT v1 | BPF-Guardian RL (Solve@2) | Mejora relativa |
|---|---:|---:|---:|---:|---:|---:|
| Síntesis privada protegida | 120 tareas | 0 / 120 (0,0 %) | 31 / 120 (25,8 %) | 54 / 120 (45,0 %) | 59 / 120 (49,2 %) | +90,3 % |
| Reparación autónoma protegida | 120 tareas | 79 / 120 (65,8 %) | 85 / 120 (70,8 %) | 91 / 120 (75,8 %) | 91 / 120 (75,8 %) | +7,1 % |
| Suite de confirmación | 60 tareas | 20 / 60 (33,3 %) | 33 / 60 (55,0 %) | 42 / 60 (70,0 %) | 44 / 60 (73,3 %) | +33,3 % |
| Suite de desarrollo estratificada N3 | 48 tareas | no disponible | 18 / 48 (37,5 %) | 24 / 48 (50,0 %) | 23 / 48 (47,9 %) | +27,7 % |
| Suite combinada protegida | 276 tareas | 79 / 276 (28,6 %) | 137 / 276 (49,6 %) | 168 / 276 (60,9 %) | 172 / 276 (62,3 %) | +25,6 % |

La columna «Mejora relativa» refleja la ganancia porcentual del BPF-Guardian RL respecto a la prior baseline (Qwen3-8B SFT v2), tal como reporta el autor. No se han publicado benchmarks generalistas (MMLU, HumanEval, GSM8K) para este adaptador en la información disponible.

## Requisitos de hardware

- El modelo base completo en bfloat16 ocupa aproximadamente 60 GB de VRAM (30B parámetros × 2 bytes). El adaptador LoRA añade una cantidad adicional pequeña; el repositorio pesa 3,1 GB, aunque el archivo del adaptador es menor.
- Con cuantización 4-bit del modelo base, la VRAM estimada baja a 15-20 GB, lo que permite su uso en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Para ejecutar en bfloat16 se recomiendan GPUs con al menos 80 GB de VRAM, como A100 80GB o H100 80GB.
- El adaptador se carga con Transformers y PEFT (`PeftModel`) sobre el modelo base. No se indica soporte nativo para vLLM, llama.cpp u Ollama en la información del adaptador; el modelo base sí está disponible en Ollama.
- No se han publicado datos de latencia ni throughput para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Especialización | Resultado en suite combinada | Licencia |
|---|---|---|---|---|---|
| NVIDIA Nemotron 3.5 Lightning 30B-A3B (base) | 30B (3B activos) | no disponible | General | 28,6 % | OpenMDW-1.1 |
| Qwen3-8B SFT v2 (baseline anterior) | 8B | no disponible | eBPF/XDP | 49,6 % | no disponible |
| Nemotron-3.5-Lightning-30B BPF-Guardian (RL) | 30B + LoRA | no disponible | eBPF/XDP | 62,3 % | MIT (adaptador) / OpenMDW-1.1 (base) |

El adaptador obtiene un 62,3 % en la suite combinada frente al 49,6 % de la línea base Qwen3-8B, lo que supone una mejora relativa del +25,6 % reportada por el autor. Frente al modelo base sin adaptar (28,6 %), la ganancia absoluta es de 33,7 puntos porcentuales. En la suite de síntesis privada protegida, la mejora relativa sobre Qwen3-8B es del +90,3 % (49,2 % vs. 25,8 %).

## Limitaciones y advertencias

- El adaptador está limitado a tareas de generación de código eBPF/XDP en C. No se documenta soporte de conversación, tool calling general ni tareas de propósito general.
- El rendimiento en la suite de síntesis privada protegida es solo del 49,2 % en modo Solve@2: más de la mitad de los programas de síntesis compleja no pasan la verificación en dos intentos.
- Riesgo de alucinación: puede generar código que parece válido sintácticamente pero que falla en compilación o en el verificador del kernel. La verificación con `clang-18` es obligatoria antes de usar cualquier salida.
- Idiomas: solo inglés y código. No hay evidencia de soporte multilingüe.
- Sesgos: no se han documentado sesgos específicos en la información disponible, pero al estar entrenado en datasets de código, puede reflejar sesgos de estilo o de prácticas de programación de esos datasets.
- Licencia: el adaptador se publica bajo MIT, pero el modelo base NVIDIA Nemotron 3.5 Lightning está bajo OpenMDW-1.1. Cualquier uso comercial debe cumplir las condiciones de esa licencia. La licencia MIT del adaptador no exime de los términos del modelo base.
- La ventana de contexto del modelo base no se especifica en la información proporcionada, por lo que no se puede garantizar un rendimiento correcto en contextos muy largos.
- La verificación se realizó en un kernel concreto (Linux 6.8.0-106-generic). Los programas generados pueden comportarse de manera diferente en otras versiones de kernel o con diferentes configuraciones de helpers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rvindra/nemotron-3.5-lightning-bpf-guardian
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Dashboard interactivo del autor: https://ravindratarunokusumo.github.io/BPF-FT-Project/
- Dataset SFT: https://huggingface.co/datasets/rvindra/bpf-guardian-sft
- Dataset RL: https://huggingface.co/datasets/rvindra/bpf-guardian-rl
- Documentación de Nemotron 3.5 Lightning en GitHub: https://github.com/NVIDIA-NeMo/Nemotron/blob/main/docs/nemotron/lightning35/README.md
- Página de Nemotron 3.5 Lightning en Ollama: https://ollama.com/library/nemotron-3.5-lightning
